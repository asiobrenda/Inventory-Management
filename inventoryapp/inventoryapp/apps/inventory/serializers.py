from rest_framework import serializers
from .models import User, Product, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=validated_data.get('password')
        )
        user.is_active = False  # Inactive until 2FA verification
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=True)
    password = serializers.CharField(max_length=128, required=True, write_only=True)


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'quantity']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    item_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'item_total']

    def get_product_name(self, obj):
        return obj.product.name if obj.product else ''

    def get_item_total(self, obj):
        return obj.get_item_total()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'username', 'date', 'items', 'total_price']

    def get_username(self, obj):
        return obj.user.username if obj.user else ''

    def get_total_price(self, obj):
        return obj.get_total_price()


class OrderCreateSerializer(serializers.ModelSerializer):
    item_data = serializers.ListField(write_only=True)
    username = serializers.CharField(write_only=True)

    class Meta:
        model = Order
        fields = ['item_data', 'username']

    def create(self, validated_data):
        item_data = validated_data.pop('item_data')
        username = validated_data.pop('username')

        # Try to get the user, or use the default "brenda" user if not found
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Get or create the default "brenda" user
            try:
                user = User.objects.get(username="brenda")
            except User.DoesNotExist:
                # Create the default user if it doesn't exist yet
                user = User.objects.create(
                    username="brenda",
                    is_active=True,
                )

        # Create the order with the user (either the found user or the default "brenda" user)
        order = Order.objects.create(user=user)

        # Create order items and capture current prices
        for item_info in item_data:
            product_id = item_info.get('product_id')
            quantity = item_info.get('quantity')

            try:
                product = Product.objects.get(id=product_id)
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=product.price  # Capture current price
                )
            except Product.DoesNotExist:
                # Skip or handle invalid product IDs
                continue

        return order

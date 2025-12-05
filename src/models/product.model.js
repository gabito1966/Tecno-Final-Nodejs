
export class Product {
    constructor(productId, name, price, description, image, category) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.description = description;
        this.image = image;
        this.category = category;
    }

    toJSON() {
        return {
            productId: this.productId,
            name: this.name,
            price: this.price,
            description: this.description,
            image: this.image,
            category: this.category
        };
    }
}

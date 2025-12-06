export class Product {
    constructor(id, name, price, description, image, category, createdAt = null) {
        this.id = id;
        this.name = name;
        this.price = Number(price);
        this.description = description;
        this.image = image || "";
        this.category = category || "Sin categoría";
        this.createdAt = createdAt?.toDate ? createdAt.toDate() : (createdAt || new Date());
    }

    toJSON() {
        return {
            name: this.name,
            price: this.price,
            description: this.description,
            image: this.image,
            category: this.category,
            createdAt: this.createdAt
        };
    }
}

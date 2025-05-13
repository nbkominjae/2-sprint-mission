import { getArticle,getArticlelist,createArticle,patchArticle,deleteArticle } from "./ArticleService";
import { getProduct, getProductList,createProduct,patchProduct,deleteProduct } from "./ProductService";





class Product{
    constructor(name,description,price,tags,images,favoriteCount){
        this.name = name;
        this.description = description;
        this.price = price;
        this.tags = tags;
        this.images = images;
        this.favoriteCount =favoriteCount;

    }
    favorite(){
        this.favoriteCount += 1;
    }

}

const product = new Product('')
console.log(product);



class ElectronicProduct extends Product{
    constructor(name,description,price,tags,images,favoriteCount,manufacturer){
        super(name,description,price,tags,images,favoriteCount)
    }
}

class Article{
    constructor(title,content,writer,likeCount){
        this.title = title;
        this.content = content;
        this.writer = writer;
        this.likeCount = likeCount;
    }
    like(){
        this.likeCount += 1;
    }
}


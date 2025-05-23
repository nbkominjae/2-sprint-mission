erDiagram
    Article ||--o{ Comment : "has"
    Product ||--o{ Comment : "has"
    Product{
        Int id PK
        String name   
        String description
        Int price   
        String tags
        Date createdAt
        Date updatedAt
    }

    Article{
        Int id PK
        String title
        String content   
        Date createdAt
        Date updatedAt

    }

    Comment{
        Int id PK
        String content
        Date createdAt
        Int articleId FK "nullable"
        Int productId FK "nullable"
    }

export function getArticlelist(){
    fetch('https://panda-market-api-crud.vercel.app/articles?page=1&pageSize=10')
    .then((res) => {
        if(!res.ok){
            throw new Error(`오류발생 상태코드: ${res.status}`)
        }else{
            return res.json();
        }
    })
    .then((data) => {console.log(data)})
    .catch((error) => {console.log(error)})
}

export function getArticle(id){
    fetch(`https://panda-market-api-crud.vercel.app/articles/${id}`)
    .then((res)=> {
        if(!res.ok){
            throw new Error(`오류발생 상태코드: ${res.status}`)
        }else{
            return res.json()
        }
    })
    .then((data) => {console.log(data)})
    .catch((error)=>{console.log(error)})    
}



const articleData = {
    image: "https://example.com/...",
    content: "게시글 내용입니다.",
    title: "게시글 제목입니다."
}

export function createArticle(articleData) {
    fetch('https://panda-market-api-crud.vercel.app/articles',{      
        method: "POST",
        body: JSON.stringify(articleData),
        headers: {
            'Content-Type':'application/json',
        },     
    })
    .then((res) => {
        if(!res.ok){
            throw new Error(`오류코드: ${res.status}`)
        }else{
            return res.json()
        }
    })
    .then((data) => {console.log(data)})
    .catch((error) => {console.log(error)}) 
}

const artPatch = {
    image: "패치내용",
    content: "패치 내용입니다.",
    title: "패치 제목입니다.",
};

export function patchArticle(id,artPatch) {
     fetch(`https://panda-market-api-crud.vercel.app/articles/${id}`,{
        method: "PATCH",
        body: JSON.stringify(artPatch),
        headers: {
            'Content-Type':'application/json'
        },      
    })
    .then((res) => {
        if(!res.ok){
            throw new Error(`오류코드: ${res.status}`)
        }else{
            return res.json()
        }
    })
    .then((data) => {console.log(data)})
    .catch((error) => {console.log(error)})
}

export function deleteArticle(id){
    fetch(`https://panda-market-api-crud.vercel.app/articles/${id}`,{
        method: "DELETE",
        body: JSON.stringify(articleData),
        headers: {
            'Content-Type':'application/json'
        },       
    })
    .then((res) => {
        if(!res.ok){
            throw new Error(`오류코드: ${res.status}`)
        }else{
            return res.json()
        }
    })
    .then((data) => {console.log(data)})
    .catch((error) => {console.log(error)})    
}



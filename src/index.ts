import {createApp} from "./app/index.js";

async function init(){
    const app=await createApp();
    app.listen(4000,()=>{
        console.log('Server is running on http://localhost:4000/graphql');
    });
}


init();

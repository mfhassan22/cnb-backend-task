import { faker } from '@faker-js/faker';
import express from 'express';
import md5 from 'md5'
import cors from 'cors'
const app = express();

app.use(express.json());
app.use(cors());
let users_list=[]
//lets generate 12 users as asked in document
for(let i=1;i<14;i++){
    let id=i;
    let email=faker.internet.email();
    let first_name=faker.name.firstName();
    let last_name=faker.name.lastName();
    let avatar=faker.internet.avatar();
    let password=md5('123456');
    users_list.push({id,email,first_name,last_name,avatar,password});
}

app.get('/users/:page/:per_page', function(req, res){
    const {page,per_page}=req.params;
    let start=(((page*per_page)-per_page));
    let end=(page*per_page);
    let total=users_list.length
    let total_pages=users_list.length/per_page;
    total_pages>Math.trunc(total_pages)?total_pages=Math.trunc(total_pages)+1:total_pages;
    if(end>total)end=total
   res.send({
    page,
    per_page,
    start,
    total,
    total_pages,
    data:(users_list.slice(start,end)).map(
        user=>{
            return{
                'id':user.id,
                'email':user.email,
                'first_name':user.first_name,
                'last_name':user.last_name,
                'avatar':user.avatar
            }
        })
    });
});

app.get('/user/:id', function(req, res){
   let user=users_list.filter((user)=>user.id==req.params.id)[0]
   res.send({data:{
    'id':user.id,
    'email':user.email,
    'first_name':user.first_name,
    'last_name':user.last_name,
    'avatar':user.avatar
   }
    });
});

app.post('/user/', function(req, res){
    const {email,first_name,last_name,avatar}=req.body;
    let user_id=users_list.length;
    let getid=false;
    while(!getid){
        let checkid=users_list.findIndex(user=>user.id==user_id);
        if(checkid==-1){
            getid=true;
            break;
        }
        user_id+=1;
    }
    let user={id:users_list.length,email,first_name,last_name,avatar};
    users_list.push({id:users_list.length,email,first_name,last_name,avatar});
    res.send(user);
 });

 app.put('/user/', function(req, res){
    const {id,email,first_name,last_name,avatar}=req.body;
    let index=users_list.findIndex(user=>user.id==id);
    //users_list[index]={id,email,first_name,last_name,avatar};
    users_list[index].id=id;
    users_list[index].email=email;
    users_list[index].first_name=first_name;
    users_list[index].last_name=last_name;
    users_list[index].avatar=avatar;
    let result="error"
    if(index>=0)result="success"
    res.send({data:{status:result}});
 });

 app.delete('/user/:id', function(req, res){
    const {id}=req.params;
    let starting_len=users_list.length;
    users_list=users_list.filter(user=>user.id!=id)
    let result="error"
    if(users_list.length<starting_len)result="success"
    res.send({data:{status:result}});
 });

 app.post('/user/signin', function(req, res){
    const {email,password}=req.body;
    var flage=false;
    let user_exists=users_list.filter((user)=>user.email==email)[0]
    if(user_exists){
        if(user_exists.password==md5(password)){
            flage=true;
        }
    }
    if(flage==true){
    res.set('token', md5(user_exists.password)).send({
        data:{
            'status':'success',
            user:{
                'id':user_exists.id,
                'email':user_exists.email,
                'first_name':user_exists.first_name,
                'last_name':user_exists.last_name,
                'avator':user_exists.avatar
            }
        }
     });
    }
    else{
        res.send({
            'status':'error',
            'message':'User not found'
        })
    }
 });
app.listen(80);
/**
 * Created by dantegg on 16-12-29.
 */
const models = require('../models')
const services = require('../services')
const router = require('koa-router')()
const path = require('path')
router.prefix('/api')

router.post('/login',async(ctx)=>{
    const body = ctx.request.body
    const user = await models.user.getByEmail(body.email)
    console.log("user",!user)
    if(!user){
        console.log("user",!user)
        //ctx.status = 301
        //ctx.redirect('/')
        ctx.body={
            success:false,
            msg:'password or username is wrong'
        }
        //return
    }
    if(body.password !== user.password){
        ctx.body={
            success:false,
            msg:'password or username is wrong'
        }
    }
    ctx.session.userId = user._id
    ctx.body={
        success:true,
        msg:'login success'
    }
    //ctx.redirect('/space')
})

router.get('/logout',async(ctx)=>{
    ctx.session = null
    ctx.body={
        "success":true,
        "msg":"logout success"
    }
})

router.get('/user',async(ctx)=>{
    const userId = ctx.session.userId
    const user = await models.user.get(userId)
    ctx.body = user ||{}
})

router.post('/postblog',async (ctx)=>{
    const body = ctx.request.body
    const blog = {
        title:body.title,
        content:body.content,
        createTime:Date.now()
    }
    // let sss = await models.blog.findNews().toArray((err,items)=>{
    //     console.log(items)
    // })
    // console.log(sss)
    ctx.body = await models.blog.create(blog)
})

//TODO 这个分页写的不对
router.post('/findBlogByPage',async(ctx)=>{
    const body = ctx.request.body
    let findTime = ''
    if(body.id === undefined){
        findTime = Date.now()
    }else{
        let record = await models.blog.find({_id:body.id})
        findTime = record.createTime
        //console.log('find record',record)
    }
    console.log('findTime',findTime)
    let blogs = await models.blog.findBlogs(findTime).toArray()
    ctx.body = await services.news.normalizedList(blogs)
})


//a simple pagination
router.post('/findBlogBySimplePagination',async(ctx)=>{
    const body = ctx.request.body
    let currentPage = body.currentPage
    let pageSize = body.pageSize
    let blogs = await models.blog.findBlogByPage(currentPage,pageSize)
    let blogList = await services.news.normalizedList(blogs)
    let blogCount = await models.blog.findBlogSize()
    ctx.body = {
        blogList:blogList,
        blogCount:blogCount
    }
})


//TODO 分页写得不对所以删除博客后续也要改
router.post('/deleteblog',async(ctx)=>{
    //console.log('sss',ctx.request.body)
    let body = ctx.request.body
    let id = body.id
    let currentPage = body.currentPage
    let pageSize = body.pageSize
    await models.blog.del(id)
    let blogs = await models.blog.findBlogByPage(currentPage,pageSize)
    let blogList = await services.news.normalizedList(blogs)
    let blogCount = await models.blog.findBlogSize()
    ctx.body = {
        blogList:blogList,
        blogCount:blogCount
    }
})

router.get('/session/get',async(ctx)=>{
    ctx.body = ctx.session
})

router.get('/session/set',async(ctx)=>{
    ctx.session.foo = 'bar'
    ctx.session.time = Date.now()
    ctx.body = ctx.session
})

router.get('/session/reset',async(ctx)=>{
    ctx.session = null
    ctx.body = 'reseted'
})

router.post('/test',async(ctx)=>{
    ctx.body = {
        foo:'bar',
        test:'zzz',
        headers:ctx.headers,
        postBody:ctx.request.body
    }
})

export default router
const express = require('express')
const shortid = require('shortid')
const createHttpError = require('http-errors')
const mongoose = require('mongoose')
const path = require('path') // built in 
//model
const ShortUrl = require('./models/url.model')
const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

mongoose.connect('mongodb://localhost:27017', {
    dbName: 'url-shortener',
    useNewUrlParser: true,
    useUnifiedTopology:true,
    useCreateIndex:true
}).then(()=>console.log('mongoose connected'))
.catch(error => console.log(
    `Error Connecting`
))

app.set('view engine', 'ejs')

app.get('/', async(req,res,next)=>{
    res.render('index')
})

app.post('/', async(req, res, next)=>{
    try {
        const {url} = req.body
        if( !url){
            throw createHttpError.BadRequest('provide a valid url!')
        }
        const ifUrlExist = await ShortUrl.findOne({url})
        if(ifUrlExist){
            res.render('index', {
                short_url: `http://localhost:3000/${ifUrlExist.shortId}`
                // short_url: `${req.headers.host}/${ifUrlExist.shortId}`
            })
        }else{
            const shortUrl = new ShortUrl({url: url, shortId: shortid.generate()})
            const result= await shortUrl.save()
            res.render('index', {
                short_url: `http://localhost:3000/${result.shortId}`
                // short_url: `${req.headers.host}/${result.shortId}`
            })

        }

        // console.log(res.getHeaderNames());

    } catch (error) {
        next(error)
        // console.log(error);
    }
})


app.get('/:shortId', async (req,res,next)=>{
    try {
        const {shortId} = req.params
        const result =await  ShortUrl.findOne({shortId})
        if(!result){
            throw createHttpError.NotFound('Short Url does not exist!')

        }
        res.redirect(result.url)
        
    } catch (error) {
        next(error)
    }
})
app.use((req, res, next)=>{
    next(createHttpError.NotFound())
})
app.use((err,req, res, next)=>{
    res.status(err.status || 500)
    res.render('index', {error: err.message})
})
app.listen(3000, () => console.log('server is running on Port 3000'));
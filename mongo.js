const mongoose = require('mongoose')

const connectionString = process.env.MONGO_DB_URI

mongoose.connect(connectionString, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false, 
    useCreateIndex: true
}).then(() => {
    console.log("database connected")
}).catch(err => {
    console.error(err)
})

process.on('uncaughtException', () => {
    Mongoose.connection.disconnect()
})

/*Note.find({}).then(result => {
    console.log(result)
    mongoose.connection.close()
})

const note = new Note({
    content: 'MongoDB is incredible',
    date: new Date(),
    important: true
})

note.save()
    .then(result => {
        console.log(result)
        mongoose.connection.close()
    })
    .catch(err => {
        console.error(err)
    })*/
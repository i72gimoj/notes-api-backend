//const http = require('http')
require('dotenv').config()
require('./mongo')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/Note')
const { Mongoose } = require('mongoose')
//const logger = require('./loggerMiddleware')

//integramos la app de notas anterior con esta, son de distinta procedencia
//esta en github midudev
app.use(cors())//cualquier origen funciona en la api
app.use(express.json())
app.use('/images', express.static('images'))

Sentry.init({
    dsn: "https://d229b1de40c74d7f982c0d03ef18000a@o912610.ingest.sentry.io/5849823",
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
  

//app.use(logger)

//const app = http.createServer((request, response) => {
//    response.writeHead(200, {'Content-Type': 'application/json'})
//    response.end(JSON.stringify(notes))
//})



app.get('/', (request, response) => {
    response.send('<h1>Hello world</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    const {id} = request.params
    
    Note.findById(id).then(note => {
        if (note){
            response.json(note)
        }
        else{
            response.status(404).end()
        }
    }).catch(err => next(err))
})

app.put('/api/notes/:id', (request, response, next) => {
    const {id} = request.params
    const note = request.body

    const newNoteInfo = {
        content: note.content, 
        important: note.important
    }

    Note.findByIdAndUpdate(id, newNoteInfo, {new: true}).then(result => {
        response.json(result)
    }).catch(error => next(error))

    //notes = notes.filter(note => note.id !== id)
})

app.delete('/api/notes/:id', (request, response, next) => {
    const {id} = request.params

    Note.findByIdAndRemove(id).then(() => {
        response.status(204).end()
    }).catch(error => next(error))

    //notes = notes.filter(note => note.id !== id)
})

app.post('/api/notes', (request, response, next) => {
    const note = request.body

    if (!note.content) {
        return response.status(400).json({
            error: 'require "content" field is missing'
        })
    }

    const newNote = new Note({
        content: note.content,
        date: new Date(),
        important: true
    })

    // const ids = notes.map(note => note.id)
    // const maxId = Math.max(...ids)

    // const newNote = {
    //     id: maxId + 1,
    //     content: note.content,
    //     date: new Date.toISOString(),
    //     important: typeof note.important !== 'undefined' ? note.important : false
    // }

    newNote.save().then(savedNote => {
        responsejson(savedNote)
    }).catch(err => next(err))
    //notes = [...notes, newNote]

    response.status(201).json(newNote)
})

//es recomendable ponerlos como middleware y exportarlos para que no esten en este archivo
app.use((request, response, next) => {
    response.status(404).end()
})

app.use(Sentry.Handlers.errorHandler());

//middleware: lee de arriba a abajo viendo si coincide
//es muy importante su orden
app.use((error, request, response, next) => {
    console.error(error)
    if (error.name === 'CastError'){
        response.status(400).send({ 
            error: 'id used is malformed'
        })
    }
    else{
        response.status(500).end()
    }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
const Hapi = require('hapi');
const Mongoose = require('mongoose');
const Joi  = require('joi');
const { PORT } = require("./constants");

require('dotenv').config();

const server = new Hapi.Server({ "host": "localhost", "port": PORT });

Mongoose.connect(`mongodb+srv://admin:${process.env.DB_PASSWORD}@playground-cq057.mongodb.net/test?retryWrites=true`, { useNewUrlParser: true })

const PersonModel = Mongoose.model("person", {
  firstname: String,
  lastname: String,
});

server.route({
  method: "POST",
  path: "/person",
  options: {
    validate: {
      payload: {
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
      },
      failAction: (request, h, error) => {
        return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
      }
    },
  },
  handler: async (request, h) => {
    try {
      const person = new PersonModel(request.payload);
      const result = await person.save();
      return h.response(result);
    } catch (e) {
      return h.response(e).code(500);
    }
  },
});

server.route({
  method: "GET",
  path: "/people",
  handler: async (request, h) => {
    try {
      const people = await PersonModel.find().exec();
      return h.response(people);
    } catch (e) {
      return h.response(e).code(500);
    }
  }
});

server.route({
  method: "GET",
  path: "/person/{id}",
  handler: async (request, h) => {
    try {
      var person = await PersonModel.findById(request.params.id).exec();
      return h.response(person);
    } catch (e) {
      return h.response(e).code(500);
    }
  }
});

server.route({
  method: "PUT",
  path: "/person/{id}",
  options: {
    validate: {
      payload: {
        firstname: Joi.string().optional(),
        lastname: Joi.string().optional(),
      },
      failAction: (request, h, error) => {
        return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
      }
    }
  },
  handler: async (request, h) => {
    try {
      const result = await PersonModel.findByIdAndUpdate(request.params.id, request.payload, { new: true });
      return h.response(result);
    } catch (e) {
      return h.response(e).code(500);
    }
  }
});

server.route({
  method: "DELETE",
  path: "/person/{id}",
  handler: async (request, h) => {
    try {
      const result = await PersonModel.findByIdAndDelete(request.params.id);
      return h.response(result);
    } catch (e) {
      return h.response(error).code(500);
    }
  }
});

const initServer = async () => {
  await server.start();
  console.log(`Hapi RESTful server is running on port ${PORT}`);
};

initServer();

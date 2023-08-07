import { PrismaClient } from "@prisma/client";
import fastify from 'fastify'
import { z } from 'zod';

/**
 * Initialize a Fastify application with logging enabled.
 * 
 * @constant {fastify.FastifyInstance}
 */
const app = fastify({ logger: true });

/**
 * Initialize the Prisma Client for database operations.
 * 
 * @constant {PrismaClient}
 */
const prisma = new PrismaClient();

/**
 * Endpoint to retrieve all users from the database.
 * 
 * @async
 * @function
 * @returns {Object} Returns an object containing an array of all users.
 */
app.get('/users', async () => {
    const users = await prisma.user.findMany();

    return { users };
});


/**
 * Endpoint to create a new user in the database.
 * 
 * Validates the incoming request body against the user schema. 
 * If validation passes, it will create a new user in the database 
 * and send a 201 status code in the response.
 * 
 * @async
 * @function
 * @param {fastify.FastifyRequest} request - Fastify request object.
 * @param {fastify.FastifyReply} reply - Fastify reply object.
 * @throws {z.ZodError} Throws an error if request body validation fails.
 * @returns {fastify.FastifyReply} Returns a response with status code 201.
 */
app.post('/users', async (request, reply) => {
    // Define the validation schema for creating a user
    const createUserSchema = z.object({
        name: z.string(),
        email: z.string().email()
    });

    // Parse and validate the request body against the schema
    const { name, email } = createUserSchema.parse(request.body);

    // Create the user in the database using Prisma
    await prisma.user.create({
        data: {
            name,
            email
        }
    })

    // Return a 201 status code indicating successful creation
    return reply.status(201).send();
});

/**
 * Starts the app application server.
 * 
 * This asynchronous function initializes the Fastify server, attempting
 * to listen on a specified port and host. Once the server is up and running, 
 * it logs the port number the server is listening on. If there's an issue 
 * starting the server, it logs the error and terminates the process with an error code.
 * 
 * @async
 * @function
 * @throws {Error} Throws an error if the server fails to start.
 * @returns {void}
 */
const start = async () => {
    try {
        // Retrieve the desired port from the environment variables or default to 3333
        const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

        // Use '0.0.0.0' to listen on all available network interfaces
        const HOST = '0.0.0.0'; 

        // Start the app server
        await app.listen({
            port: PORT,
            host: HOST
        });

        // Determine and log the port the server is listening on
        const addressInfo = app.server.address();
        const port = addressInfo && typeof addressInfo === 'object' ? addressInfo.port : null;
        console.log(`🚀 server listening on ${port}`);
    } catch (err) {
        // Log any errors encountered during server initialization
        app.log.error(err);
        // Exit process with an error code
        process.exit(1);
    }
}

// start server
start();

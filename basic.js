const express = require("express");
const axios = require("axios");
const redis = require("redis");
const app = express();

const redisPort = 6379
const client = redis.createClient();



client.on('connect', () => console.log('Redis Client Connected'));

//log error to the console if any occurs
client.on('error', (err) => console.log('Redis Client Connection Error', err));

// app.get("/jobs", async (req, res) => {
//     const searchTerm = req.query.search;
//     try {
//         const jobs = await axios.get(`https://jobs.github.com/positions.json?search=${searchTerm}`);
//         res.status(200).send({
//             jobs: jobs.data,
//         });	
//     } catch(err) {
//         res.status(500).send({message: err.message});
//     }
// });

app.get("/jobs", (req, res) => {
    const searchTerm = req.query.search;
    try {
        client.get(searchTerm, async (err, jobs) => {
            if (err) throw err;
    
            if (jobs) {
                res.status(200).send({
                    jobs: JSON.parse(jobs),
                    message: "data retrieved from the cache"
                });
            } else {
                // const jobs = await axios.get(`https://jobs.github.com/positions.json?search=${searchTerm}`);
                const jobs = await axios.get(`https://jsonplaceholder.typicode.com/posts`);
                client.setex(searchTerm, 600, JSON.stringify(jobs));
                res.status(200).send({
                    jobs: jobs,
                    message: "cache miss"
                });
            }
        });
    } catch(err) {
        res.status(500).send({message: err.message});
    }
});

app.listen(process.env.PORT || 3090, () => {
    console.log("Node server started");
});

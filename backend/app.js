const express = require('express');
const { Storage } = require('@google-cloud/storage');
const csv = require('csv-parser');
const cors = require('cors');
const { default: axios } = require('axios');
const stream = require('stream'); 
const app = express();

app.use(cors());
const PORT = process.env.PORT ?? 3001;
const storage = new Storage();
const bucketName = 'nsa-asteroids'; 

function randomValues(min, max) {
    return (Math.random() * (max - min) + min).toFixed(3);
}

async function getAsteroidsFromCSVFile(bucketName, fileName, columns) {
    return new Promise((resolve, reject) => {
        const results = [];
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        const fileStream = file.createReadStream();
        
        fileStream
            .pipe(csv())
            .on('data', (asteroids) => {
                const filteredAsteroids = {};
                columns.forEach(column => {
                    if (asteroids[column] !== undefined && asteroids[column] !== '') {
                        filteredAsteroids[column] = asteroids[column];
                    } else {
                        // Assign random value if diameter is missing
                        if (column === 'diameter') {
                            filteredAsteroids[column] = `${randomValues(0.3, 1.5)}`;
                        }
                    }
                });
                results.push(filteredAsteroids);
            })
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

// Filtering logic for full_name only
function applyFilters(asteroids, filters) {
    return asteroids.filter(asteroid => {
        const conditions = [
            { key: 'full_name', value: filters.full_name, compare: (a, b) => a === b }
        ];

        return conditions.every(condition => {
            if (condition.value !== undefined && condition.value !== null) {
                return condition.compare(asteroid[condition.key], condition.value);
            }
            return true;
        });
    });
}

// ASTEROIDS endpoint with pagination and full_name filtering
app.get("/asteroids", async (req, res) => {
    const { page = 1, limit = 10, full_name } = req.query;
    const columns = ['full_name', 'a', 'e', 'i', 'per_y', 'diameter'];

    try {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const [files] = await storage.bucket(bucketName).getFiles({
            versions: false
        });
        const csvFiles = files.filter(file => file.name.endsWith('.csv'));

        let allAsteroids = [];
        for (const file of csvFiles) {
            try{
                const asteroidsFromFile = await getAsteroidsFromCSVFile(bucketName, file.name, columns);
                allAsteroids.push(...asteroidsFromFile);
            }catch(e){
                console.log(e);
            }
        }

        // Apply full_name filtering based on query parameter
        const filters = { full_name };
        allAsteroids = applyFilters(allAsteroids, filters);

        // Pagination and sorting
        const paginatedAsteroids = allAsteroids.sort((asteroid1, asteroid2) => parseFloat(asteroid2.a) > parseFloat(asteroid1.a) ? -1 : 1)
            .slice(startIndex, endIndex);

        res.json(paginatedAsteroids);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
});


app.get("/planets", async (req, res) => {
    const { page = 1, limit = 10, full_name } = req.query;
    const columns = ['full_name', 'a', 'e', 'om', 'w', 'i', 'per_y', 'diameter'];

    try {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        let bucketName = 'nsa-planets';

        const [files] = await storage.bucket("nsa-planets").getFiles();
        const csvFiles = files.filter(file => file.name.endsWith('.csv'));
        console.log(csvFiles);

        let allAsteroids = [];
        for (const file of csvFiles) {
            const asteroidsFromFile = await getAsteroidsFromCSVFile(bucketName, file.name, columns);
            allAsteroids.push(...asteroidsFromFile);
        }

        // Apply full_name filtering based on query parameter
        const filters = { full_name };
        allAsteroids = applyFilters(allAsteroids, filters);

        // Pagination and sorting
        const paginatedAsteroids = allAsteroids.sort((asteroid1, asteroid2) => parseFloat(asteroid2.a) > parseFloat(asteroid1.a) ? -1 : 1)
            .slice(startIndex, endIndex);

        res.json(paginatedAsteroids);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
});

// COMETS endpoint with pagination
app.get("/comets", async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Fetch comet data from NASA's API
        const response = await axios.get('https://data.nasa.gov/resource/b67r-rgxc.json');
        let comets = response.data;

        // Filter and map comets to relevant fields
        comets = comets.map(comet => ({
            e: comet.e,
            i_deg: comet.i_deg,
            q_au_1: comet.q_au_1,
            q_au_2: comet.q_au_2,
            p_yr: comet.p_yr,
            moid_au: comet.moid_au,
            object: comet.object
        }))
        .sort((comet1, comet2) => comet2.e > comet1.e ? -1 : 1) 
        .slice(startIndex, endIndex); 

        res.json(comets);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

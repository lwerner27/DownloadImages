const fs = require('fs')
const path = require("path")
const axios = require("axios")

// Set this variable either getImageLinks or downloadImages
const task = "downloadImages"
const apiEndpoint = "https://db.ygoprodeck.com/api/v2/cardinfo.php?banlist=tcg&sort=type"

if (task === "getImageLinks") {
    getImageLinks(apiEndpoint)
} else {
    downloadImages()
}

// This function calls the api and gets all the necessary data needed for automating the image downloads
// All the data from the api response will be saved to the json.txt file.
function getImageLinks(url) {
    console.log("you are getting all the necessary images links.")

    axios.get(url)
    .then(res => {
        let cards = res.data[0]
        fs.writeFile("json.txt", JSON.stringify(cards), (err) => {
            if (err) throw err
            console.log("Card info has been saved.")
        })
    })
}

// Once we have all the image links and other information this function will handle downloading the images 
// They will be saved to the images folder.
function downloadImages() {
    console.log("You are downloading all the images you have links for.")

    fs.readFile("json.txt", 'utf8', (err, data) => {
        if (err) throw err
        
        let cards = JSON.parse(data)

        cards.forEach((card) => {
            downloadCard(card.image_url, `${card.id}.jpg`)
        })
    })
}

async function downloadCard(url, fileName) {
    let filePath = path.join(__dirname, "images", fileName)
    const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream"
    })

    response.data.pipe(fs.createWriteStream(filePath));

    return new Promise((resolve, reject) => {
        response.data.on("end", () => {
            resolve()
        })
        response.data.on("error", (err) => {
            reject(err)
        })
    })

}
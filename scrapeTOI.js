const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');


const isElementVisible = async (page, cssSelector) => {
    let visible = true;
    await page
      .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
      .catch(() => {
        visible = false;
      });
    return visible;
  };


var data =[];
var id=1;
//using puppeteer with cheerio

const selectorForLoadMoreButton = '._3BnB0 button';

const fetch =async (url, location, category) => {
    // console.log(url);
    // return;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();    
    await page.goto(url, {timeout: 180000});
        
    let loadMoreVisible = await isElementVisible(page, selectorForLoadMoreButton);
    while (loadMoreVisible) {
    await page
        .click(selectorForLoadMoreButton, { delay: 2000})
        .catch(() => {});

        loadMoreVisible = await isElementVisible(page, selectorForLoadMoreButton);
    }

    const localData =[];

        try{

        let bodyHtml = await page.evaluate(()=> document.body.innerHTML);
        var $ = cheerio.load(bodyHtml);
        // console.log('cheerio output');
        // console.log($);


        var container = $('#storyBody > div > div.dYMaU > div > div >div > div');
        // console.log('container = '+ container);

        container.each((index, content) =>{
            const incidents = $(content).find('div');

            incidents.each((index,element) =>{
                // console.log('element printed');
                const details = $(element).find($('a > div'));
                const title = $(details).find($('div > span')).text();
                const date = $(details).find($('div')).text().split('/')[1];
                const description = $(details).find($('p > span')).text();

                // console.log('Title '+ title);
                // console.log('Description '+ description);
                // console.log('Date '+ date);

                if(title || description)
                {
                    localData.push({
                        id,
                        title,
                        description,
                        date,
                        location: location,
                        category: category
                    });  
                    id+=1;      
                }
            });
        
    })
}
    catch(error){
        console.log(error);
    }

    await browser.close();
    return localData;

    };

async function run(){

        let place = 'Anand%20Vihar';
        let keywords = ['Rape','Molestation','Eve%20Teasing','Sexual%20Harassment','Touching','Acid%20Attack']
        // ,'Eve%20Teasing','Sexual%20Harassment','Touching','Acid%20Attack']
        var i=5;
        // while(i < keywords.length)
        // {
            // setTimeout(async() => {
                let category = keywords[i].replace('%20',' ');
                let location = place.replace('%20', ' ');
                let url = `https://timesofindia.indiatimes.com/topic/${place}%20${keywords[i]}/news`;
                console.log(url);
                // return;
                try{
                    
                    const pageData = await fetch(url,location,category);
                    console.log('page data ='+ pageData);
                        // console.log('page Data = '+pageData.pageData);
                        if(pageData.length !==0)
                    {
                        data = [...data,...pageData];
                    }               
                    createJSON();

                }
                catch(err){
                    console.log('Error + '+ err);
                }
                // setTimeout(()=>{
                //         console.log('page data ='+ pageData);
                //         // console.log('page Data = '+pageData.pageData);
                //         if(pageData.length !==0)
                //     {
                //         data = [...data,...pageData];
                //     }               
                // },30000);

                i++;
        
            // }, 50000);

        // }

}

function createJSON(){
        // setTimeout(()=>{
        const obj = {
            data: data
        };
        const json = JSON.stringify(obj);
        fs.writeFile('TOI_New_Cat.json', json,'utf-8', (err)=>{
            console.log(err);
        });
    
    // },100000);

}
// function writeJSON()
// {
//     let rawData = fs.readFileSync('TOI_key_articles.json');
//     let articles = JSON.parse(rawData);
//     data.forEach((item,i)=>{
//         articles.push(item);
//     });

//     const json = JSON.stringify(articles);
//     fs.writeFile("TOI_key_articles.json", json,'utf-8', (err)=>{
//         if(err)
//         {
//             throw err;
//         }
//         console.log('Done writing');
//     } )
// }

run()

// .then(()=>{
//     setTimeout(()=>{
//         const obj = {
//             data: data
//         };
//         const json = JSON.stringify(obj);
//         fs.writeFile('TOI_key_articles.json', json,'utf-8', (err)=>{
//             console.log(err);
//         });
    
//     },100000);
// });

  
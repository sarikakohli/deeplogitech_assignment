const http = require("http");

const https = require("https");


function stripTags(str){
  return str.replace(/<[^>]*>/g, "").trim();
}


http.createServer((req, res)=>{
  if (req.url === "/getTimeStories"){
    https.get("https://time.com/section/ideas/", (resp)=>{
      let html = "";
      resp.on("data", chunk => {
        html=html+ chunk;
      });

      resp.on("end",()=>{
        let stories = [];
        let anchors = html.split("<a ");

       
        for (let i = 1; i < anchors.length && stories.length < 6; i++) {
          let part = anchors[i];

          let hrefStart=part.indexOf('href="');
          if(hrefStart == -1) continue;
          hrefStart += 6;

          let hrefEnd=part.indexOf('"',hrefStart);
          if(hrefEnd == -1) continue;

          let link=part.substring(hrefStart, hrefEnd);

          
          if(!link.startsWith("https://time.com/")) continue;

          let tagClose=part.indexOf(">", hrefEnd);
          let aClose=part.indexOf("</a>", tagClose);
          if(tagClose== -1 || aClose== -1) continue;

          let innerHTML = part.substring(tagClose+1, aClose);
          let title = stripTags(innerHTML);

          if(title.length>0){
            stories.push({title,link});
          }
        }

        res.writeHead(200,{"Content-Type":"application/json"});
        res.end(JSON.stringify(stories));
      });
    }).on("error", (err)=>{
      res.writeHead(500);
      res.end("Error fetching data: "+ err.message);
    });
  }else{
    res.writeHead(200,{ "Content-Type": "text/plain" });
    res.end("Type /getTimeStories in the URL to get latest stories");
  }
}).listen(8080,()=>{
  console.log("Server connected at port 8080");
});
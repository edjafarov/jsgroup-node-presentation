var http=require("http");

http.createServer(function(req,res){
    res.end("Hallo world");
}).listen(3000);

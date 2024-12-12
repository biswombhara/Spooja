const express= require ("express");
const app = express();
const mongoose= require("mongoose");
const Listing =require("./models/listing.js");
const path= require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError=require( "./utils/ExpressErrors.js");
const {listingSchema, reviewSchema}=require("./Schema.js")
const Review =require("./models/reviews.js");


const MongoURL='mongodb://127.0.0.1:27017/wanderlust';



main().then(()=>{
    console.log("connected to DB");
}).catch(error=>{
console.log(error);

})
async function main(){
    await mongoose.connect(MongoURL);
}
app.get("/",(req,res)=>{
    res.send("Hi I am Root");
   })

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
    }
    if(result.error){
        throw new ExpressError(400,errMsg)
    }else{
        next();
    }
}
const validateReview=(req,res,next)=>{
    let {error }= reviewSchema.validate(req.body);
    if(error){
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(404,errMsg);
    }else{
      next();
    }
}


//Index Route


app.get("/listings",wrapAsync(async(req,res)=>{
const allListings=await Listing.find({});
res.render("listings/index.ejs",{allListings});
  }));

//New Route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs")
});

//Show Route
app.get("/listings/:id",wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  }));

//Create Route
app.post("/listings",validateListing, wrapAsync(async(req,res,next)=>{
 let result=listingSchema.validate(req.body);
 console.log(result);
const newlisting= new Listing(req.body.listing);

await newlisting.save();
res.redirect("/listings")



}));



// Edit Route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    const listing= await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
app.put("/listings/:id" ,validateListing, wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid listing")
    }
    let{id}=req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");

}));

//Reviews
app.post("/listings/:id/reviews", validateReview,wrapAsync(async(req,res)=>{
  let listing= await Listing.findById(req.params.id);
  let newReview=new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewID",wrapAsync(async(req,res)=>{
 let{id, reviewId}= req.params;

 await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewSchema}});
 await Review.findByIdAndDelete(reviewId);


 res.redirect(`/listings/${listing._id}`);
}));





// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   })
//   await sampleListing.save();
//   console.log("sample saved");
//   res.send("sucessfull");
// })

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
})

app.use((err,req,res,next)=>{
   let{statusCode=500,message="Something went wrong !!"}=err;
//   res.status(statusCode).send(message);
res.status(statusCode).render("errors.ejs",{message});

})

app.listen(8080,()=>{
    console.log("Sucess");
});
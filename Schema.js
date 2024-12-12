const Joi = require('joi');

 module.exports.listingSchema=Joi.object({
    listing:Joi.object({
        title:Joi.string().required,
        description:Joi.string().required,
        Image:Joi.string().allow("",null),
        Price:Joi.number().min(0),
        Location:Joi.string().required,
        Country:Joi.string().required
    }).required(),

});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required()
    }).required()
});
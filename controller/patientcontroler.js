const patient = require('../schema/patientProfileSchema');
const tips = require('../schema/tipsSchema');
const email = require('../utils/mail');

const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const bcrypt = require('bcryptjs');

//////////////////////////////////////////////////////////////////////// for profile pic upload and resize using multer and sharp package
const multerStorage = multer.memoryStorage();
const profileImgFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image'))cb(null,true);
    else cb((err)=>console.log(err),false)
}
const upload = multer({
    storage:multerStorage,
    fileFilter:profileImgFilter
});
exports.uploadPatientProfileImg = upload.single('profile-img');
exports.resizeProfileImage = (req,res,next)=>{
    if(!req.file)return next();
    const extension = req.file.mimetype.split('/')[1];
    req.file.filename=`patient-${req.body.name}-${Date.now()}.${extension}`;
    sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`profile_pic/${req.file.filename}`);
    next();
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.updateProfile = async(req,res)=>{
    try{
        const currpatient = await patient.findOne({email:req.body.email});
        if(req.body.age) currpatient.age = req.body.age;
        if(req.body.gender) currpatient.age = req.body.gender;
        if(req.body.height) currpatient.age = req.body.height;
        if(req.body.weight) currpatient.age = req.body.weight;

        const oldprofile_img = currpatient.profile_img;
        if(req.file){
            currpatient.profile_img=req.file.filename;
            currpatient.save();
            fs.unlinkSync(`${__dirname}/../profile_pic/${oldprofile_img}`,(err)=>{
                if(err)res.send (err);
            });
        }
        else currpatient.save();

        res.send(currpatient);
    }
    catch(err){
        res.send(err);
    }
}


/////////////////////////////////////////////////////////////////////////////////////////SIGNUP
exports.signup = (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({error: err});
        } else {
            const Patient =new patient({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                password: hash
            });
            Patient
                .save()
                .then(result => {
                    const verifyToken = Patient.createPasswordResetToken();
                    const verifyURL = `${req.protocol}://${req.get('host')}/users/verifyemail/${resetToken}`;
                    res.status(201).json({
                        message: 'User created'
                    });

                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        }
    })
}


exports.get_bmi = async(req,res)=>{
    
}

exports.homePage = async(req,res)=>{
    res.send('hello patient');
}
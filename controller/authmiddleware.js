import jwt from "jsonwebtoken";
function authmiddleware(req,res,next){
     const existingToken = req.cookies?.token;
     console.log("existing token",existingToken);
     if(!existingToken) return res.status(401).json({message:"unauthorized"});
     const decoded=jwt.verify(existingToken,process.env.JWT_SECRET_KEY);
     if(decoded){
        req.user_id = decoded.id;
        next();
     }else{
         return res.status(403).json({message:"forbidden"})
     }

}
export default authmiddleware
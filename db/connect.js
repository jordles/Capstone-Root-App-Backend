import mongoose from "mongoose";

async function connect(){
  try{
    const conn = await mongoose.connect(process.env.ATLAS_URI);
    console.log(`Connected to MongoDB ${conn.connections[0].name}`);
  }
  catch(e){
    console.error(e);
  }
}

export default connect
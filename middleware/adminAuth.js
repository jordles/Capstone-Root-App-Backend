const adminKeys = JSON.parse(process.env.ADMIN_KEYS);
const adminAuth = async (req, res, next) => {
  try {
    const adminKey = req.query["admin-key"] || req.headers['x-admin-key'];
    if(!adminKey) return res.status(400).json({error: "Admin Key Required"});
    if(!adminKeys.includes(adminKey)) return res.status(401).json({error: "Invalid Admin Key"});
    
    next();
  } catch (error) {
    res.status(403).json({ error: 'Admin access denied' });
  }
};


export default adminAuth;
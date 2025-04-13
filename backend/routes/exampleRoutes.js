// POST request
router.post('/', (req, res) => {
    const data = req.body;
    res.json({ message: 'POST request successful', data });
  });
  
  module.exports = router;
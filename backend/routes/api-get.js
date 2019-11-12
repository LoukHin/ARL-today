const timeTable = require('../models/timetable')

module.exports = router => {
    router.get('/get/:originId/:destination', (req, res) => {
        const { originId, destination } = req.params
        const destinationId = (destination > originId) ? 8 : 1
        const query = timeTable.where({ originId, destinationId })
        query.findOne((err, data) => {
            if (err) return console.log(err)
            if (data !== null && typeof data !== 'undefined') {
                const time = ([0, 6].includes(new Date().getDay())) ? data.timeHoliday : data.timeNormal
                const price = 15 + (Math.abs(originId - destination) - 1) * 5

                for (let key of time.keys()) {
                    hour = new Date().getHours()
                    if (!(hour <= parseInt(key) && parseInt(key) <= hour + 1)) {
                        time.delete(key)
                    }
                }

                data = []
                time.forEach((mins, hour) => {
                    mins.forEach(min => {
                        const currentMin = new Date().getMinutes()
                        const currentHour = new Date().getHours()
                        if ((currentMin <= min && hour == currentHour)
                            || (currentMin >= min && hour != currentHour)) {
                            data.push(`${hour}:${min}`)
                        }
                    })
                })

                res.json({ status: 200, price, time: data })
            }else{
                res.json({ status: 404 })
            }
        })
    })
}

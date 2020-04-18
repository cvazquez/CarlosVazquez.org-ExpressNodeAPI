module.exports = (ds) => {

    class blog {
        constructor() {
        }

       getCategories(res) {
            return new Promise(resolve => {
                ds.query(`
                    SELECT c.name, cu.name AS nameURL, count(distinct(ec.entryId)) AS entryCount
                    FROM categories c
                    INNER JOIN categoryurls cu ON cu.categoryId = c.id
                    INNER JOIN entrycategories ec ON ec.categoryId = c.id
                    INNER JOIN entries e ON e.id = ec.entryId
                    GROUP BY ec.categoryId
                    ORDER BY c.name`,
                    function (err, rows, fields) {
                        if (err) throw err

                        resolve(rows);
                })
            })
        }
    }
    return new blog();
}
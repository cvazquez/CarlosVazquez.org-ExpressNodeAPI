var express = require('express'),
    app		= express();

module.exports = (ds) => {

    class blog {
        constructor() {
        }

       getCategories() {
            return new Promise(resolve => {
                ds.query(`
                    SELECT c.name, cu.name AS nameURL, count(distinct(ec.entryId)) AS entryCount
                    FROM categories c
                    INNER JOIN categoryurls cu ON cu.categoryId = c.id
                    INNER JOIN entrycategories ec ON ec.categoryId = c.id
                    INNER JOIN entries e ON e.id = ec.entryId
                    GROUP BY ec.categoryId
                    ORDER BY c.name`,
                    (err, rows) => {
						if (err) throw err

					/* Testing async
						setTimeout(function(){
							console.log("getCategories")
                        	resolve(rows);
						}, 5000); */

					app.get('env') === "development" && console.log("getCategories")

					resolve(rows);

                })
            })
        }

        getLatestPosts(limit) {
            return new Promise(resolve => {
				ds.query(`SELECT 	entries.id,
									entries.title,
									entryurls.titleURL,
									Date_Format(entries.publishAt, '%b %e, %Y') AS publishDate,
                                    entries.teaser AS contentTeaser,
                                    count(distinct(entrydiscussions.id)) AS commentCount
                            FROM entries
                            LEFT OUTER JOIN entrydiscussions ON
                                                entries.id = entrydiscussions.entryId AND entrydiscussions.entryDiscussionId IS NULL
                                                AND ( entrydiscussions.approvedAt IS NOT NULL OR (dateDiff(now(), entrydiscussions.createdAt) <= 1) )
                                                AND entrydiscussions.deletedAt IS NULL
                            LEFT OUTER JOIN entryurls ON entries.id = entryurls.entryId AND entryurls.isActive = 1 AND entryurls.deletedAt IS NULL
                            WHERE entries.deletedAt IS NULL AND entries.publishAt <= now()
                            GROUP BY entries.id
                            ORDER BY entries.id desc
                            LIMIT ?`, limit,
                    (err, rows) => {
						if (err) throw err

						app.get('env') === "development" && console.log("getLatestBlogs")

                        resolve(rows);
                })
            })
        }

        getLatestComments(limit) {
            return new Promise(resolve => {
				ds.query(`SELECT 	users.firstName,
									CutText(entrydiscussions.content, 100, '...') AS commentTeaser,
									entrydiscussions.id AS entrydiscussionid,
									Date_Format(entrydiscussions.createdAt, '%b %e, %Y') AS commentDate,
                                    entryurls.titleURL,
                                    (	SELECT count(*)
                                        FROM entrydiscussions ed2
                                        WHERE ed2.entryDiscussionId = entrydiscussions.id AND (ed2.approvedAt IS NOT NULL OR (dateDiff(now(), ed2.createdAt) <= 1))
                                                    AND ed2.deletedAt IS NULL
                                    ) AS replyCount
                            FROM users
                            INNER JOIN entrydiscussions ON users.id = entrydiscussions.userId
                                                    AND (entrydiscussions.approvedAt IS NOT NULL OR (dateDiff(now(), entrydiscussions.createdAt) <= 1))
                                                    AND entrydiscussions.deletedAt IS NULL
                                                    AND entrydiscussions.entryId <> 168
                            INNER JOIN entries ON entrydiscussions.entryId = entries.id AND entries.deletedAt IS NULL AND entries.publishAt <= now()
                            INNER JOIN entryurls ON entries.id = entryurls.entryId AND entryurls.deletedAt IS NULL
                            WHERE users.deletedAt IS NULL
                            GROUP BY entrydiscussions.id
                            ORDER BY entrydiscussions.id desc
                            LIMIT ?`, limit,
                    (err, rows) => {
						if(err) throw err

						app.get('env') === "development" && console.log("getLatestComments")

                        resolve(rows);
                    })
            })
        }

        getTopCategories(limit) {
            return new Promise(resolve => {
				ds.query(`  SELECT  c.id,
									c.name,
                                    cu.name AS nameURL,
                                    count(distinct(ec.entryId)) AS entryCount
							FROM entries e
							INNER JOIN entrycategories ec ON ec.entryId = e.id
							INNER JOIN categoryurls cu ON cu.categoryId = ec.categoryId
							INNER JOIN categories c ON c.id = cu.categoryId
                            WHERE e.publishAt <= now()
                            GROUP BY ec.categoryId
                            ORDER BY count(distinct(ec.entryId)) desc
                            LIMIT ?`, limit,
                (err, rows) => {
					if(err) throw err

					app.get('env') === "development" && console.log("getTopCategories")

                    resolve(rows);
                })
            })
		}

		getAllBlogSlugs(limit) {
            return new Promise(resolve => {
				ds.query(`	SELECT	DISTINCT entryurls.titleURL
							FROM entries
							INNER JOIN entryurls ON entries.id = entryurls.entryId AND entryurls.isActive = 1 AND entryurls.deletedAt IS NULL
							WHERE entries.deletedAt IS NULL AND entries.publishAt <= now()`,
                    (err, rows) => {
						if (err) throw err

						app.get('env') === "development" && console.log("getAllBlogSlugs")

                        resolve(rows);
                })
            })
		}

		getPostByTitle(titleURL) {
			return new Promise(resolve => {
				ds.query(`	SELECT	e.content,
									e.title,
									e.teaser
							FROM entryurls eu
							INNER JOIN entries e ON e.id = eu.entryId
							WHERE eu.titleURL = ?`, titleURL,
					(err, rows) => {
						if(err) throw err

						app.get('env') === "development" && console.log("getBlogPostByTitle")

						resolve(rows[0]);
					})
			})
		}
    }

    return new blog();
}
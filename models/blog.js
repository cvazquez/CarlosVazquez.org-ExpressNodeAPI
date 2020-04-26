var express = require('express'),
    app		= express();

module.exports = (ds) => {

    class blog {
        constructor() {
        }

       getCategories() {
            return new Promise(resolve => {
                ds.query(`
					SELECT	c.name,
							cu.name AS nameURL,
							count(distinct(ec.entryId)) AS entryCount
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

					resolve(rows);
                })
            })
		}

		getCategoryByName(categoryName) {
			return new Promise(resolve => {
				ds.query(`
					SELECT	c.id,
							c.name AS categoryName,
							c.description,
							cu.name AS URLName
					FROM 	categoryurls cu
					INNER JOIN categories c ON c.id = cu.categoryId
					WHERE	cu.name = ?
							AND cu.isActive = 1`, categoryName,
					(err, rows) => {
						if (err) throw err

						app.get('env') === "development" && console.log("getCategoryByName")

					resolve(rows);
				})
			})
		}

		getCategoryPosts(categoryName) {
			return new Promise(resolve => {
				ds.query(`
					SELECT	e.title,
							eu.titleURL,
							Date_Format(e.publishAt, '%b %e, %Y') AS publishDate,
							e.teaser AS contentTeaser
					FROM	categoryurls cu
					INNER JOIN entrycategories ec ON ec.categoryId = cu.categoryId
					INNER JOIN entries e ON e.id = ec.entryId
					INNER JOIN entryurls eu ON eu.entryId = e.id
					WHERE	cu.name = ?
							AND e.publishAt <= now()
					ORDER BY e.publishAt DESC`, categoryName,
				(err, rows) => {
					if(err) throw err

					resolve(rows);
				})
			})
		}

		getFlikrImagesByTitleURL(titleURL) {
			return new Promise(resolve => {
				ds.query(`	SELECT	fsp.id,
									fsp.title,
									fsp.description,
									fsp.squareurl,
									fsp.squarewidth,
									fsp.squareheight,
									fsp.mediumurl,
									fsp.mediumwidth,
									fsp.mediumheight,
									fspu.name AS mediumUrlReWritten
							FROM entryurls eu
							INNER JOIN entryflickrsets efs ON	efs.entryId = eu.entryId
																AND efs.deletedAt IS NULL
							INNER JOIN flickrsets fs ON 	fs.id = efs.flickrSetId
															AND fs.deletedAt IS NULL
							INNER JOIN flickrsetphotos fsp ON	fsp.flickrSetId = fs.id
																AND fsp.deletedAt IS NULL
							INNER JOIN flickrsetphotourls fspu ON	fspu.flickrSetPhotoId = fsp.id
																	AND fspu.isActive = 1
							WHERE eu.titleURL = ?
							ORDER BY fsp.orderid`, titleURL,
				(err, rows) => {
					if(err) throw err

					resolve(rows)
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

		getPostByTitleURL(titleURL) {
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

		getPostCommentsByTitleURL(titleURL) {
			return new Promise(resolve => {
				ds.query(`	SELECT 	ed.id,
									ed.content,
									Date_Format(ed.createdAt, '%b %e, %Y') AS postDate,
									Time_Format(ed.createdAt, '%l:%i %p') AS postTime,
									ed.firstName,
									ed.lastName,
									IF(ed2.id IS NOT NULL, 1, 0) AS hasReplies,
									(	SELECT count(*)
										FROM entrydiscussions userComments
										WHERE	userComments.email = ed.email AND userComments.deletedAt IS NULL
												AND (
														userComments.approvedAt IS NOT NULL
														OR
														dateDiff(now(), userComments.createdAt) <= 1
													 )
									) AS userCommentCount
							FROM entryurls eu
							INNER JOIN entrydiscussions ed ON	ed.entryId = eu.entryId
																AND ed.entryDiscussionId IS NULL
																AND ed.deletedAt IS NULL
																AND (
																		ed.approvedAt IS NOT NULL
																		OR
																		dateDiff(now(), ed.createdAt) <= 1
																	)
							LEFT OUTER JOIN users ON	users.id = ed.userId
														AND users.deletedAt IS NULL
							LEFT JOIN entrydiscussions ed2 ON	ed2.entryDiscussionId = ed.id
																AND ed2.deletedAt IS NULL
							WHERE 	eu.titleURL = ?
									AND eu.isActive = 1
									AND eu.deletedAt IS NULL
							GROUP BY ed.id
							ORDER BY ed.id desc`, titleURL,
					(err, rows) => {
						if(err) throw err

						resolve(rows)
					})
			})
		}

		getPostSlugs(limit) {
            return new Promise(resolve => {
				ds.query(`	SELECT	DISTINCT entryurls.titleURL
							FROM entries
							INNER JOIN entryurls ON entries.id = entryurls.entryId AND entryurls.isActive = 1 AND entryurls.deletedAt IS NULL
							WHERE entries.deletedAt IS NULL AND entries.publishAt <= now()`,
                    (err, rows) => {
						if (err) throw err

                        resolve(rows);
                })
            })
		}

		getSeriesPostsByTitleURL(titleURL) {
			return new Promise(resolve => {
				ds.query(`	SELECT	e.id AS entryId,
									s.name,
									e.title,
									eu.titleURL
							FROM entryurls eu
							INNER JOIN seriesentries se ON	se.entryId = eu.entryId
															AND se.deletedAt IS NULL
							INNER JOIN seriesentries se2 ON	se2.seriesid = se.seriesId
															AND se.deletedAt IS NULL
							INNER JOIN series s ON	s.id = se.seriesId
													AND s.deletedAt IS NULL
							INNER JOIN entries e ON	e.id = se2.entryId
													AND e.deletedAt IS NULL
							WHERE 	eu.titleURL = ?
									AND eu.isActive = 1
									AND eu.deletedAt IS NULL
							ORDER BY se2.sequence
				`, titleURL,
				(err, rows) => {
					if(err) throw err

					resolve(rows)
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
    }

    return new blog();
}
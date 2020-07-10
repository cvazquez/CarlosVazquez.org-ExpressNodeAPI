var express = require('express'),
    app		= express();

class blogAdmin {
	constructor(ds) {
		this.ds = ds;
	}

	getCategories() {
		return new Promise((resolve, reject) => {
			this.ds.query(`
				SELECT id, name
				FROM categories
				WHERE deletedAt IS NULL
				ORDER BY name;`,
			(err, rows) => {
				if (err) {
					if(app.get('env') === "development") {
						console.log("********* getCategories(body) error ***********");
						console.log(err);
					}

					resolve({
						failed	: true
					})
				}

				resolve(rows);
			})
		}).catch(err => {
			console.log("********* Promise Error: getCategories() *********");
			console.log(err);
		})
	}

	getFlickrSets(noEntry) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	SELECT	fs.id,
									fs.title,
									efs.entryId
							FROM flickrsets fs
							LEFT JOIN entryflickrsets efs ON 	efs.flickrSetId = fs.id
																AND efs.deletedAt IS NULL
							WHERE fs.deletedAt IS NULL`
							+ (noEntry ? ` AND efs.flickrSetId IS NULL ` : ` `) +
							`	GROUP BY fs.id
								ORDER BY fs.title;`,
					(err, rows) => {
						if(err) {
							if(app.get('env') === "development") {
								console.log("********* getFlickrSets() error ***********");
								console.log(err);
							}

							resolve({
								failed	: true
							})
						}

						resolve(rows);
					})
		}).catch(err => {
			console.log("*********PROMISE Error getFlickrSets()*******");
			console.log(err);
		})
	}

	getPostById(entryId) {
		return new Promise(resolve => {
			this.ds.query(`
				SELECT	e.id,
						e.title,
						e.teaser,
						e.content,
						metaDescription,
						metaKeyWords,
						Date_Format(e.createdAt, '%Y-%m-%d %H:%i') AS createdAt,
						Date_Format(e.publishAt, '%Y-%m-%d %H:%i') AS publishAt,
						Date_Format(e.deletedAt, '%Y-%m-%d %H:%i') AS deletedAt,
						efs.flickrSetId
				FROM entries e
				LEFT JOIN entryflickrsets efs ON 	efs.entryId = e.id
													AND efs.deletedAt IS NULL
				WHERE e.id = ?;`, entryId,
				(err, rows) => {
					if (err) {
						if(app.get('env') === "development") {
							console.log("********* getPostById(body) error ***********");
							console.log(err);
						}

						resolve({
							failed	: true
						})
					}

				resolve(rows);
			})
		}).catch(err => {
			console.log("********* Promise Error: getPostById() *********");
			console.log(err);
		})
	}

	getPostCategories(id) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	SELECT c.id, c.name
							FROM entrycategories ec
							INNER JOIN categories c ON	c.id = ec.categoryId
														AND c.deletedAt IS NULL
							WHERE	ec.entryId = ?
									AND ec.deletedAt IS NULL`, id,
					(err, rows) => {
						if (err) {
							if(app.get('env') === "development") {
								console.log("********* getPostCategories(body) error ***********");
								console.log(err);
							}

							resolve({
								failed	: true
							})
						}

						resolve(rows);
				})
		}).catch(err => {
			console.log("********* Promise Error: getPostCategories() *********");
			console.log(err);
		})
	}

	getPosts() {
		return new Promise(resolve => {
			this.ds.query(`
				SELECT	e.id,
						e.title,
						Date_Format(e.createdAt, '%Y-%m-%d %H:%i') AS createdAt,
						Date_Format(e.publishAt, '%Y-%m-%d %H:%i') AS publishAt,
						Date_Format(e.deletedAt, '%Y-%m-%d %H:%i') AS deletedAt
				FROM entries e
				ORDER BY e.createdAt DESC;`,
				(err, rows) => {
					if (err) {
						if(app.get('env') === "development") {
							console.log("********* getPostsToEdit(body) error ***********");
							console.log(err);
						}

						resolve({
							failed	: true
						})
					}

				resolve(rows);
			})
		}).catch(err => {
			console.log("********* Promise Error: getPostsToEdit(body) *********");
			console.log(err);
		})
	}

	getPostSeriesById(id) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	SELECT	DISTINCT	s.id,
												s.name
							FROM seriesentries se
							INNER JOIN series s ON 	s.id = se.seriesId
													AND s.deletedAt IS NULL
							WHERE 	se.entryId = ?
									AND se.deletedAt IS NULL;`, id,
				(err, rows) => {
					if (err) {
						if(app.get('env') === "development") {
							console.log("********* getPostSeriesById(id) error ***********");
							console.log(err);
						}

						resolve({
							failed	: true
						})
					}

					resolve(rows);
				})
		}).catch(err => {
			console.log("********* Promise Error: getPostSeriesById(id) *********");
			console.log(err);
		})
	}

	getSeries() {
		return new Promise((resolve, reject) => {
			this.ds.query(`	SELECT	id,
									name,
									contentTeaser,
									publishAt,
									createdAt,
									deletedAt
							FROM series
							ORDER BY name;`,
					(err, rows) => {
						if(err) {
							if(app.get('env') === "development") {
								console.log("********* getSeries() error ***********");
								console.log(err);
							}

							resolve({
								failed	: true
							});
						}

						resolve(rows);
					})
		}).catch(err => {
			console.log("********* Promise Error: getSeries() *********");
			console.log(err);
		})
	}

	getSeriesPostsById(id) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	SELECT	se.sequence,
									se.entryId,
									e.title,
									Date_Format(se.createdAt, '%Y-%m-%d %H:%i') AS createdAt
							FROM seriesentries se
							INNER JOIN entries e ON e.id = se.entryId
													AND e.deletedAt IS NULL
							WHERE	se.seriesId = ?
									AND se.deletedAt IS NULL
							ORDER BY se.sequence;`, id,
					(err, rows) => {
						if(err) {
							if(app.get('env') === "development") {
								console.log("********* getSeriesPostsById(id) error ***********");
								console.log(err);
							}

							resolve({
								failed	: true
							});
						}

						resolve(rows);
					})
		}).catch(err => {
			console.log("********* Promise Error: getSeriesPostsById(id) *********");
			console.log(err);
		})
	}

	addCategory(name) {
		return new Promise((resolve, reject) => {
			this.ds.query(	`	INSERT INTO categories
								SET name		= ?,
									createdAt = now()`,
								[name],
				(err, rows) => {
					if(err) {
						if(app.get('env') === "development") {
							console.log("********* addCategory(name) error ***********");
							console.log(err);
						}

						resolve({
							failed	: true,
							message	: (err.errno === 1062 ? `Duplicate Category Submitted. Check if ${name} already exists.` : null)
						});
					}

					resolve(rows);
				})
		}).catch(err => {
			console.log("********* Promise Error: addCategory(name) *********");
			console.log(err);
		})
	}

	addPost(body) {
		return new Promise((resolve, reject) => {
			this.ds.query(	`	INSERT INTO entries
								SET title			= ?,
									teaser			= ?,
									content			= ?,
									metaDescription	= ?,
									metaKeyWords	= ?,
									publishAt		= ?,
									createdAt 		= now()`,
								[body.title, body.teaser, body.content, body.metaDescription, body.metaKeyWords, body.publishAt],
				(err, rows) => {
					if(err) {
						if(app.get('env') === "development") {
							console.log("********* addPost(body) error ***********");
							console.log(err);
						}

						resolve({
							failed: true,
							message	: (err.errno === 1062 ? `"${body.title}" already exists. Create a new title.` : null)
						});
					}

					resolve(rows);
				})
		}).catch(err => {
			console.log("********* Promise Error: addPost(body) *********");
			console.log(err);
		})
	}

	addSeries(name) {
		return new Promise((resolve, reject) => {
			this.ds.query(	`	INSERT INTO series
								SET name		= ?,
									createdAt	= now()`,
								[name],
				(err, rows) => {
					if(err) {
						if(app.get('env') === "development") {
							console.log("********* addSeries(name) error ***********");
							console.log(err);
						}

						resolve({
							failed	: true,
							message	: (err.errno === 1062 ? `Duplicate series Submitted. Check if ${name} already exists.` : null)
						});
					}

					resolve(rows);
				})
		}).catch(err => {
			console.log("********* Promise Error: addSeries(name) *********");
			console.log(err);
		})
	}

	saveDraft(body) {
		return new Promise((resolve, reject) => {
			this.ds.query(	`	INSERT INTO entrydrafts
								SET entryId 	= ?,
									content		= ?,
									createdAt 	= now();`, [body.entryId, body.content],
								(err, rows) => {
									if(err) {
										if(app.get('env') === "development") {
											console.log("********* saveDraft(body) error ***********");
											console.log(err);
										}

										resolve({
											failed: true
										});
									}

									resolve(rows);
								})
		}).catch(err => {
			console.log("********* Promise Error: saveDraft() *********");
			console.log(err);
		})
	}

	updateCategory(body) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	UPDATE categories
							SET name		= ?,
								updatedAt	= now()
							WHERE id = ?`, [body.name, body.id],
				(err, rows) => {
					if(err) {
						if(app.get('env') === "development") {
							console.log("********* updateCategory(body) error ***********");
							console.log(err);
						}

						resolve({
							failed: true
						});
					}

					resolve(rows);
				})
		}).catch(err => {
			console.log("********* Promise Error: updateCategory() *********");
			console.log(err);
		})
	}

	updatePost(body) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	UPDATE entries
							SET title			= ?,
								teaser			= ?,
								content			= ?,
								metaDescription	= ?,
								metaKeyWords	= ?,
								publishAt		= ?,
								updatedAt		= now()
							WHERE id = ?;`,
							[body.title, body.teaser, body.content, body.metaDescription, body.metaKeyWords, body.publishAt, body.entryId],
			(err, rows) => {
				if(err) {
					if(app.get('env') === "development") {
						console.log("********* updatePost(body) error ***********");
						console.log(err);
					}

					resolve({
						failed: true
					});
				}

				resolve(rows);
			}
		)}).catch(err => {
			console.log("********* Promise Error updatePost(body) *********");
			console.log(err);
		})
	}

	updatePostSeriesSequence(postId, seriesId, sequence) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	UPDATE seriesentries
							SET	sequence = ?
							WHERE 	seriesId = ?
									AND entryId = ?`,
							[sequence, seriesId, postId],
					(err, rows) => {
						if(err) {
							if(app.get('env') === "development") {
								console.log("********* updatePostSeriesSequence(postId, seriesId, sequence");
								console.log(err);
							}

							resolve({
								failed: true
							});
						}

						resolve(rows);
					})
		}).catch(err => {
			console.log("******* Promise Error updatePostSeriesSequence()");
			console.log(err);
		})
	}

	updateSeries(body) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	UPDATE series
							SET name		= ?,
								updatedAt	= now()
							WHERE id = ?`, [body.name, body.id],
				(err, rows) => {
					if(err) {
						if(app.get('env') === "development") {
							console.log("********* updateSeries(body) error ***********");
							console.log(err);
						}

						resolve({
							failed: true
						});
					}

					resolve(rows);
				})
		}).catch(err => {
			console.log("********* Promise Error: updateSeries(body) *********");
			console.log(err);
		})
	}

	deactivateSeries(id) {
		console.log("deactivateSeries")
		return new Promise((resolve, reject) => {
			this.ds.query(`	UPDATE series
							SET deletedAt = now()
							WHERE id = ?`, id,
				(err, rows) => {
					if(err) {
						if(app.get('env') === "development") {
							console.log("********* deactivateSeries(id) error ***********");
							console.log(err);
						}

						resolve({
							failed: true
						});
					}

					console.log(rows)

					resolve(rows);
				})
		}).catch(err => {
			console.log("********* Promise Error: deactivateSeries(id) *********");
			console.log(err);
		})
	}

	deletePostCategories(entryId, categoryNames) {
		return new Promise((resolve, reject) => {
			this.ds.query(`
							DELETE ec
							FROM categories c
							INNER JOIN entrycategories ec ON	ec.entryId = ?
																AND ec.categoryId = c.id
							WHERE 	c.name NOT IN (?);`,
							[entryId, categoryNames],
			(err, rows) => {
				if(err) {
					if(app.get('env') === "development") {
						console.log("********* deletePostCategories(entryId, categoryNames) error ***********");
						console.log(err);
					}

					resolve({
						failed: true
					});
				}

				resolve(rows);
			}
		)}).catch(err => {
			console.log("********* deletePostCategories(entryId, categoryNames) Promise Error *********");
			console.log(err);
		})
	}

	savePostCategories(entryId, categoryNames) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	INSERT IGNORE INTO entrycategories (entryId, categoryId, createdAt)
							SELECT ?, c.id, now()
							FROM categories c
							WHERE c.name IN (?);`, [entryId, categoryNames],
			(err, rows) => {
				if(err) {
					if(app.get('env') === "development") {
						console.log("********* savePostCategories(entryId, categoryNames) error ***********");
						console.log(err);
					}

					resolve({
						failed: true
					});
				}

				resolve(rows);
			}
		)}).catch(err => {
			console.log("********* savePostCategories(entryId, categoryNames) Promise Error *********");
			console.log(err);
		})
	}

	deactivatePostById(id) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	UPDATE entries
							SET deletedAt = now()
							WHERE id = ?`, [id],
				(err, rows) => {
					if(err) {
						if(app.get('env') === "development") {
							console.log("********* deactivatePostById(id) error ***********");
							console.log(err);
						}

						resolve({
							failed: true
						});
					}

					resolve(rows);
				})
		}).catch(err => {
			console.log("********* deactivatePostById(id) Promise Error *********");
			console.log(err);
		})
	}

	deletePostSeries(entryId, seriesNames) {
		return new Promise((resolve, reject) => {
			this.ds.query(`
							DELETE es
							FROM series s
							INNER JOIN seriesentries es ON	es.entryId = ?
															AND es.seriesId = s.id
							WHERE 	s.name NOT IN (?);`,
							[entryId, seriesNames],
			(err, rows) => {
				if(err) {
					if(app.get('env') === "development") {
						console.log("********* deletePostSeries(entryId, seriesNames) error ***********");
						console.log(err);
					}

					resolve({
						failed: true
					});
				}

				resolve(rows);
			}
		)}).catch(err => {
			console.log("********* deletePostSeries(entryId, seriesNames) Promise Error *********");
			console.log(err);
		})
	}

	savePostFlickrSet(entryId, flickrSetId) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	INSERT IGNORE INTO entryflickrsets (entryId, flickrSetId, createdAt)
							VALUES (?, ?, now())`, [entryId, flickrSetId],
				(err, rows) => {
					if(err) {
						if(app.get("env") === "development") {
							console.log("*********savePostFlickrSet(entryId, flickrSetId)*******");
							console.log(err);
						}

						resolve({
							failed	: true
						})
					}

					resolve(rows);
				})
		}).catch(err => {
			console.log("**********savePostFlickrSet(entryId, flickrSetId) Promise Error********");
			console.log(err);
		})
	}


	savePostSeries(entryId, seriesNames) {
		return new Promise((resolve, reject) => {
			this.ds.query(`	INSERT IGNORE INTO seriesentries (entryId, seriesId, createdAt)
							SELECT ?, s.id, now()
							FROM series s
							LEFT JOIN seriesentries se ON se.seriesId = s.id AND se.entryId = ?
							WHERE 	s.name IN (?)
									AND se.seriesId IS NULL;`, [entryId, entryId, seriesNames],
			(err, rows) => {
				if(err) {
					if(app.get('env') === "development") {
						console.log("********* savePostSeries(entryId, seriesNames) error ***********");
						console.log(err);
					}

					resolve({
						failed: true
					});
				}

				resolve(rows);
			}
		)}).catch(err => {
			console.log("********* savePostSeries(entryId, seriesNames) Promise Error *********");
			console.log(err);
		})
	}

}

exports.blogAdmin = blogAdmin;
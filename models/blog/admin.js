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
						Date_Format(e.deletedAt, '%Y-%m-%d %H:%i') AS deletedAt
				FROM entries e
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
								SET name	= ?`,
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
									publishAt		= ?`,
								[body.title, body.teaser, body.content, body.metaDescription, body.metaKeyWords, body.publishAt],
				(err, rows) => {
					if(err) {
						if(app.get('env') === "development") {
							console.log("********* addPost(body) error ***********");
							console.log(err);
						}

						resolve({
							failed: true
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
								SET name	= ?`,
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
								SET entryId = ?,
									content	= ?;`, [body.entryId, body.content],
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
			console.log("********* Promise Error *********");
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
						console.log("********* updatePostCategories(body) error ***********");
						console.log(err);
					}

					resolve({
						failed: true
					});
				}

				resolve(rows);
			}
		)}).catch(err => {
			console.log("********* updatePostCategories(body) Promise Error *********");
			console.log(err);
		})
	}

	savePostCategories(entryId, categoryNames) {
		const categoryInsertValues = [];

		categoryNames.forEach(categoryName => {
			categoryInsertValues.push([entryId, categoryName]);
		});

		return new Promise((resolve, reject) => {
			this.ds.query(`	INSERT IGNORE INTO entrycategories (entryId, categoryId)
							SELECT ?, c.id
							FROM categories c
							WHERE c.name IN (?);`, [entryId, categoryNames],
			(err, rows) => {
				if(err) {
					if(app.get('env') === "development") {
						console.log("********* savePostCategories(body) error ***********");
						console.log(err);
					}

					resolve({
						failed: true
					});
				}

				resolve(rows);
			}
		)}).catch(err => {
			console.log("********* savePostCategories(body) Promise Error *********");
			console.log(err);
		})
	}

}

exports.blogAdmin = blogAdmin;
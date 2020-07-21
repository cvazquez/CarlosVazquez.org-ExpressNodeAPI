/*
	Queries for Admin Blog Post Editor
*/

const model	= require('../model');

class blogAdmin extends model {
	constructor(ds) {
		super(ds);
	}

	// ********************** Queries Passed to super this.getQueryResults() ***************

	getCategories() {
		return this.getQueryResults(
			"getCategories",
			`SELECT id, name
			FROM categories
			WHERE deletedAt IS NULL
			ORDER BY name;`
		)
	}

	getFlickrSets(noEntry) {
		return this.getQueryResults(
			"getFlickrSets",
			`	SELECT	fs.id,
						fs.title,
						efs.entryId
				FROM flickrsets fs
				LEFT JOIN entryflickrsets efs ON 	efs.flickrSetId = fs.id
													AND efs.deletedAt IS NULL
				WHERE fs.deletedAt IS NULL`
				+ (noEntry ? ` AND efs.flickrSetId IS NULL ` : ` `) +
				`	GROUP BY fs.id
					ORDER BY fs.title;`,
			[]
		)
	}

	getPostById(entryId) {
		return this.getQueryResults(
			"getPostById",
			`SELECT	e.id,
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
			WHERE e.id = ?
			GROUP BY e.id;`, [entryId]);
	}

	getPostCategories(id) {
		return this.getQueryResults(
			"getPostCategories",
			`	SELECT c.id, c.name
				FROM entrycategories ec
				INNER JOIN categories c ON	c.id = ec.categoryId
											AND c.deletedAt IS NULL
				WHERE	ec.entryId = ?
						AND ec.deletedAt IS NULL`, [id]);
	}

	getPosts() {
		return this.getQueryResults(
			"getPosts",
			`	SELECT	e.id,
						e.title,
						Date_Format(e.createdAt, '%Y-%m-%d %H:%i') AS createdAt,
						Date_Format(e.publishAt, '%Y-%m-%d %H:%i') AS publishAt,
						Date_Format(e.deletedAt, '%Y-%m-%d %H:%i') AS deletedAt
				FROM entries e
				ORDER BY e.createdAt DESC;`);
	}

	getPostSeriesById(id) {
		return this.getQueryResults(
			"getPostSeriesById",
			`	SELECT	DISTINCT	s.id,
									s.name
				FROM seriesentries se
				INNER JOIN series s ON 	s.id = se.seriesId
										AND s.deletedAt IS NULL
				WHERE 	se.entryId = ?
						AND se.deletedAt IS NULL;`, [id]);
	}

	getSeries() {
		return this.getQueryResults(
			"getSeries",
			`	SELECT	id,
						name,
						contentTeaser,
						publishAt,
						createdAt
				FROM series
				WHERE deletedAt IS NULL
				ORDER BY name;`);
	}

	getSeriesPostsById(id) {
		return this.getQueryResults(
			"getSeriesPostsById",
			`	SELECT	se.sequence,
						se.entryId,
						e.title,
						Date_Format(se.createdAt, '%Y-%m-%d %H:%i') AS createdAt
				FROM seriesentries se
				INNER JOIN entries e ON e.id = se.entryId
										AND e.deletedAt IS NULL
				WHERE	se.seriesId = ?
						AND se.deletedAt IS NULL
				ORDER BY se.sequence;`, [id]);
	}

	addCategory(name) {
		return this.getQueryResults(
			"addCategory",
			`	INSERT INTO categories
				SET name		= ?,
					createdAt = now()`,
				[name]);
	}

	addPost(body) {
		return this.getQueryResults(
			"addPost",
			`	INSERT INTO entries
				SET title			= ?,
					teaser			= ?,
					content			= ?,
					metaDescription	= ?,
					metaKeyWords	= ?,
					publishAt		= ?,
					createdAt 		= now()`,
				[body.title, body.teaser, body.content, body.metaDescription, body.metaKeyWords, body.publishAt]);
	}

	addSeries(name) {
		return this.getQueryResults(
			"addSeries",
			`	INSERT INTO series
				SET name		= ?,
					createdAt	= now()`,
				[name]);
	}

	saveDraft(body) {
		return this.getQueryResults(
			"saveDraft",
			`	INSERT INTO entrydrafts
				SET entryId 	= ?,
					content		= ?,
					createdAt 	= now();`, [body.entryId, body.content]);
	}

	updateCategory(body) {
		return this.getQueryResults(
			"updateCategory",
			`	UPDATE categories
				SET name		= ?,
					updatedAt	= now()
				WHERE id = ?`, [body.name, body.id]);
	}

	updatePost(body) {
		return this.getQueryResults(
			"updatePost",
			`	UPDATE entries
				SET title			= ?,
					teaser			= ?,
					content			= ?,
					metaDescription	= ?,
					metaKeyWords	= ?,
					publishAt		= ?,
					updatedAt		= now()
				WHERE id = ?;`,
				[body.title, body.teaser, body.content, body.metaDescription, body.metaKeyWords, body.publishAt, body.entryId]);
	}

	updatePostSeriesSequence(postId, seriesId, sequence) {
		return this.getQueryResults(
			"updatePostSeriesSequence",
			`	UPDATE seriesentries
				SET	sequence = ?
				WHERE 	seriesId = ?
						AND entryId = ?`,
				[sequence, seriesId, postId]);
	}

	updateSeries(body) {
		return this.getQueryResults(
			"updateSeries",
			`	UPDATE series
				SET name		= ?,
					updatedAt	= now()
				WHERE id = ?`, [body.name, body.id]);
	}

	deactivateSeries(id) {
		return this.getQueryResults(
			"deactivateSeries",
			`	UPDATE series
				SET deletedAt = now()
				WHERE id = ?`, [id]);
	}

	deletePostCategories(entryId, categoryNames) {
		const insertValues = categoryNames.length ? [entryId, categoryNames] : [entryId];

		return this.getQueryResults(
			"deletePostCategories",
			`	DELETE ec
				FROM categories c
				INNER JOIN entrycategories ec ON	ec.entryId = ?
													AND ec.categoryId = c.id
			` + (categoryNames.length ? `WHERE c.name NOT IN (?);` : `;`),
			insertValues);
	}

	savePostCategories(entryId, categoryNames) {
		return this.getQueryResults(
			"savePostCategories",
			`	INSERT IGNORE INTO entrycategories (entryId, categoryId, createdAt)
				SELECT ?, c.id, now()
				FROM categories c
				WHERE c.name IN (?);`, [entryId, categoryNames]);
	}

	deactivatePostById(id) {
		return this.getQueryResults(
			"deactivatePostById",
			`	UPDATE entries
				SET deletedAt = now()
				WHERE id = ?`, [id]);
	}

	deletePostSeries(entryId, seriesNames) {
		const insertValues = seriesNames.length ? [entryId, seriesNames] : [entryId];

		return this.getQueryResults(
			"deletePostSeries",
			`	DELETE es
				FROM series s
				INNER JOIN seriesentries es ON	es.entryId = ?
												AND es.seriesId = s.id`
				+ (seriesNames.length ? ` WHERE s.name NOT IN (?);` : `;`),
				insertValues);
	}

	deletePostFlickrSet(entryId, flickrSetId) {
		const insertValues = flickrSetId.length ? [entryId, flickrSetId] : [entryId];

		return this.getQueryResults(
			"deletePostFlickrSet",
			`	DELETE efs
				FROM entryflickrsets efs
				WHERE efs.entryId = ?`
				+ (flickrSetId.length ? ` AND efs.flickrSetId NOT IN (?);` : `;`),
				insertValues);
	}

	savePostFlickrSet(entryId, flickrSetId) {
		return this.getQueryResults(
			"savePostFlickrSet",
			`	INSERT IGNORE INTO entryflickrsets (entryId, flickrSetId, createdAt)
				VALUES (?, ?, now())`, [entryId, flickrSetId]);
	}

	savePostSeries(entryId, seriesNames) {
		return this.getQueryResults(
			"savePostSeries",
			`	INSERT IGNORE INTO seriesentries (entryId, seriesId, createdAt)
				SELECT ?, s.id, now()
				FROM series s
				LEFT JOIN seriesentries se ON se.seriesId = s.id AND se.entryId = ?
				WHERE 	s.name IN (?)
						AND se.seriesId IS NULL;`, [entryId, entryId, seriesNames]);
	}
}

exports.blogAdmin = blogAdmin;
var express = require('express'),
	app		= express(),
	model	= require('../model');

class blog extends model {
	constructor(ds) {
		super(ds);
	}

	// ********************** Queries Passed to super this.getQueryResults() ***************

	getCategories() {
		return this.getQueryResults(
			"getCategories",
			`	SELECT	c.name,
						cu.name AS nameURL,
						c.teaser,
						count(distinct(ec.entryId)) AS entryCount
				FROM categories c
				INNER JOIN categoryurls cu ON cu.categoryId = c.id
				INNER JOIN entrycategories ec ON ec.categoryId = c.id
				INNER JOIN entries e ON e.id = ec.entryId
				GROUP BY ec.categoryId
				ORDER BY c.name`
		)
	}

	getCategoryByName(categoryName) {
		return this.getQueryResults(
			"getCategoryByName",
			`
				SELECT	c.id,
						c.name AS categoryName,
						c.description,
						c.teaser,
						cu.name AS URLName
				FROM 	categoryurls cu
				INNER JOIN categories c ON c.id = cu.categoryId
				WHERE	cu.name = ?
						AND cu.isActive = 1`, [categoryName]
		)
	}

	getCategoryPosts(categoryName) {
		return this.getQueryResults(
			"getCategoryPosts",
			`SELECT	e.title,
					eu.titleURL,
					Date_Format(e.publishAt, '%b %e, %Y') AS publishDate,
					e.teaser AS contentTeaser
			FROM	categoryurls cu
			INNER JOIN entrycategories ec ON ec.categoryId = cu.categoryId
			INNER JOIN entries e ON e.id = ec.entryId
			INNER JOIN entryurls eu ON eu.entryId = e.id
			WHERE	cu.name = ?
					AND e.publishAt <= now()
			GROUP BY e.id
			ORDER BY e.publishAt DESC`, [categoryName]
		)
	}

	getFlikrImagesByTitleURL(titleURL) {
		return this.getQueryResults(
			"getFlikrImagesByTitleURL",
			`	SELECT	fsp.id,
									fsp.title,
									fsp.description,
									fsp.squareURL,
									fsp.squareWidth,
									fsp.squareHeight,
									fsp.smallURL,
									fsp.smallWidth,
									fsp.smallHeight,
									fsp.mediumURL,
									fsp.mediumWidth,
									fsp.mediumHeight,
									fsp.largeURL,
									fsp.largeWidth,
									fsp.largeHeight,
									fspu.name AS mediumUrlReWritten
						FROM entryurls eu
						INNER JOIN entryflickrsets efs ON	efs.entryId = eu.entryId
															AND efs.deletedAt IS NULL
						INNER JOIN flickrsets fs ON 	fs.id = efs.flickrSetId
														AND fs.deletedAt IS NULL
						INNER JOIN flickrsetphotos fsp ON	fsp.flickrSetId = fs.id
															AND fsp.deletedAt IS NULL
						LEFT JOIN flickrsetphotourls fspu ON	fspu.flickrSetPhotoId = fsp.id
																AND fspu.isActive = 1
						WHERE eu.titleURL = ?
						ORDER BY fsp.orderid`, [titleURL]
		)
	}

	getImagePosts(limit) {
		return this.getQueryResults(
			"getImagePosts",
			`	SELECT	e.id,
						e.title,
						e.teaser,
						Date_Format(e.publishAt, '%b %e, %Y') AS publishDate,
						eu.titleURL,
						count(DISTINCT(fsp.id)) AS imageCount
				FROM entryflickrsets efs
				INNER JOIN entries e ON e.id = efs.entryId
										AND e.deletedAt IS NULL
				INNER JOIN flickrsetphotos fsp ON 	fsp.flickrSetId = efs.flickrSetId
													AND fsp.deletedAt IS NULL
				INNER JOIN entryurls eu ON 	eu.entryId = e.id
											AND eu.deletedAt IS NULL
				WHERE efs.deletedAt IS NULL
				GROUP BY efs.entryId
				ORDER BY efs.createdAt DESC
				${limit ? `LIMIT ?` : ""};`, [limit]
		)
	}

	getLatestComments(limit) {
		return this.getQueryResults(
			"getLatestComments",
			`SELECT 	users.firstName,
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
			LIMIT ?`, [limit]
		)
	}

	getLatestPosts(limit) {
		return this.getQueryResults(
			"getLatestPosts",
			`SELECT 	entries.id,
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
			LIMIT ?`, [limit]
		)
	}

	getLatestSeries(limit) {
		return this.getQueryResults(
			"getLatestSeries",
			`	SELECT	s.name,
						Date_Format(s.publishAt, '%b %e, %Y') AS publishDate,
						s.contentTeaser,
						su.nameURL,
						se.entryCount
				FROM series s
				INNER JOIN seriesurls su ON su.seriesId = s.id
											AND su.deletedAt IS NULL
											AND su.isActive = 1
				INNER JOIN (
					SELECT seriesId, COUNT(*) AS entryCount
					FROM seriesentries se
					WHERE se.deletedAt IS NULL
					GROUP BY seriesId
				) se ON se.seriesId = s.id
				WHERE s.deletedAt IS NULL
				ORDER BY id desc
				${limit ? `LIMIT ?` : ""};`, [limit]
		)
	}

	getPostByTitleURL(titleURL) {
		return this.getQueryResults(
			"getPostByTitleURL",
			`	SELECT	e.id,
						e.content,
						e.title,
						e.teaser,
						Date_Format(e.publishAt, '%b %e, %Y') AS publishAt
				FROM entryurls eu
				INNER JOIN entries e ON e.id = eu.entryId
				WHERE eu.titleURL = ?`, [titleURL]
		)
	}

	getPostCommentsByTitleURL(titleURL) {
		return this.getQueryResults(
			"getPostCommentsByTitleURL",
			`	SELECT 	ed.id,
						ed.entryDiscussionId AS replyToId,
						ed.content,
						Date_Format(ed.createdAt, '%b %e, %Y') AS postDate,
						Time_Format(ed.createdAt, '%l:%i %p') AS postTime,
						ed.firstName,
						ed.lastName,
						IF(ed2.id IS NOT NULL, 1, 0) AS hasReplies,
						userCommentCount.total AS userCommentCount
				FROM entryurls eu
				INNER JOIN entrydiscussions ed ON	ed.entryId = eu.entryId
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
				LEFT JOIN (	SELECT userComments.email, COUNT(*) AS total
							FROM entrydiscussions userComments
							WHERE	userComments.deletedAt IS NULL
									AND (
											userComments.approvedAt IS NOT NULL
										)
							GROUP BY userComments.email
				) AS userCommentCount ON userCommentCount.email = users.email
				WHERE 	eu.titleURL = ?
						AND eu.isActive = 1
						AND eu.deletedAt IS NULL
				GROUP BY ed.id
				ORDER BY ed.id desc`, [titleURL]
		)
	}

	getPostSlugs() {
		return this.getQueryResults(
			"getPostSlugs",
			`	SELECT	DISTINCT entryurls.titleURL
				FROM entries
				INNER JOIN entryurls ON entries.id = entryurls.entryId AND entryurls.isActive = 1 AND entryurls.deletedAt IS NULL
				WHERE entries.deletedAt IS NULL AND entries.publishAt <= now()`
		)
	}

	getSeries(seriesName) {
		return this.getQueryResults(
			"getSeries",
			`	SELECT	s.name AS seriesName,
						e.teaser,
						e.title AS entryTitle,
						e.id AS entryId,
						Date_Format(e.publishAt, '%b %e, %Y') AS publishDate,
						eu.titleURL
				FROM seriesurls su
				INNER JOIN series s ON 	s.id = su.seriesId
										AND s.deletedAt IS NULL
				INNER JOIN seriesentries se ON 	se.seriesId = s.id
												AND se.deletedAt IS NULL
				INNER JOIN entries e ON	e.id = se.entryId
										AND e.deletedAt IS NULL
				INNER JOIN entryurls eu ON	eu.entryId = e.id
											AND eu.isActive = 1
											AND eu.deletedAt IS NULL
				WHERE 	su.nameURL = ? AND su.deletedAt IS NULL;`, [seriesName]
		)
	}

	getSeriesPostsByTitleURL(titleURL) {
		return this.getQueryResults(
			"getSeriesPostsByTitleURL",
			`	SELECT	e.id AS entryId,
						s.name,
						e.title,
						eu2.titleURL
				FROM entryurls eu
				INNER JOIN seriesentries se ON	se.entryId = eu.entryId
												AND se.deletedAt IS NULL
				INNER JOIN seriesentries se2 ON	se2.seriesid = se.seriesId
												AND se.deletedAt IS NULL
				INNER JOIN series s ON	s.id = se.seriesId
										AND s.deletedAt IS NULL
				INNER JOIN entries e ON	e.id = se2.entryId
										AND e.deletedAt IS NULL
				INNER JOIN entryurls eu2 ON eu2.entryId = e.id
											AND eu2.deletedAt IS NULL
				WHERE 	eu.titleURL = ?
						AND eu.isActive = 1
						AND eu.deletedAt IS NULL
				ORDER BY se2.sequence
			`, [titleURL]
		)
	}

	getSearchResults(terms) {
		return this.getQueryResults(
			"getSearchResults",
			`	SELECT	entries.id,
						entries.title AS label,
						entryurls.titleURL AS value
				FROM entries
				JOIN entryurls ON entries.id = entryurls.entryId AND entryurls.isActive = 1 AND entryurls.deletedAt IS NULL
				WHERE	MATCH (title,content) AGAINST (? IN NATURAL LANGUAGE MODE)
							AND entries.publishAt <= now();`, [terms]
		)
	}

	getTopCategories(limit) {
		return this.getQueryResults(
			"getTopCategories",
			`  SELECT  c.id,
						c.name,
						c.teaser,
						cu.name AS nameURL,
						count(distinct(ec.entryId)) AS entryCount
				FROM entries e
				INNER JOIN entrycategories ec ON ec.entryId = e.id
				INNER JOIN categoryurls cu ON cu.categoryId = ec.categoryId
				INNER JOIN categories c ON c.id = cu.categoryId
				WHERE e.publishAt <= now()
				GROUP BY ec.categoryId
				ORDER BY count(distinct(ec.entryId)) desc
				LIMIT ?`, [limit]
		)
	}

	createPostComment(body, requestTracking) {
		return this.getQueryResults(
			"createPostComment",
			`	INSERT INTO entrydiscussions
					SET entryId				= ?,
						entryDiscussionId	= null,
						userId				= null,
						firstName			= ?,
						lastname			= ?,
						email				= ?,
						content				= ?,
						emailValidationString = null,
						wantsReplies		= ?,
						httpRefererExternal	= ?,
						httpRefererInternal	= ?,
						httpUserAgent		= ?,
						ipAddress			= ?,
						pathInfo			= ?,
						createdAt			= now(),
						createdBy			= null`,
						[
							body.id,
							body.firstName,
							body.lastName,
							body.email,
							body.comment,
							(isNaN(body.emailReply) ? 0 : 1),
							requestTracking.referer,
							requestTracking.referer,
							requestTracking.userAgent,
							requestTracking.ip,
							requestTracking.pathInfo
						]
		)
	}

	createVisit(requestTracking) {
		return this.getQueryResults(
			"createVisit",
			`	INSERT INTO logvisits
				SET httpRefererExternal	= ?,
					httpRefererInternal	= ?,
					httpUserAgent		= ?,
					ipAddress			= ?,
					pathInfo			= ?,
					createdAt			= now()`,
				[
					requestTracking.referer,
					requestTracking.referer,
					requestTracking.userAgent,
					requestTracking.ip,
					requestTracking.pathInfo
				]
		)
	}
}

exports.blog = blog;
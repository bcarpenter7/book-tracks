const Book = require("../models/book")


module.exports = {
    index,
    show,
    new: newBook,
    create,
    delete: deleteBook,
    edit,
    update: updateBook,
	search,
	resultsShow,
	results
}



async function index(req, res){
    const booksAll = await Book.find({})
    const context = {
        books: booksAll,
		title: 'Books'
    }
    res.render('books/index', context)
}

function search(req, res) {
	const context = {
		title: 'Search',
		errorMsg: ''
	}
	res.render('books/search', context)
}

async function results(req, res){
	if (!(req.body.title) && !(req.body.author)) {
		const context = {
			title: 'Search',
			errorMsg: ''
		}
		res.render('books/search', context)
	}
	try {
		let jsonRes;
		const title = req.body.title;
		const author = req.body.author;
		if(title && author){
			jsonRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}+inauthor:${author}&api=AIzaSyA712kv4XX64tekfGyNf4uWoCoIq4wxfVc`)
		} else if (title){
			jsonRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}&api=AIzaSyA712kv4XX64tekfGyNf4uWoCoIq4wxfVc`)
		} else if (author){
			jsonRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}&api=AIzaSyA712kv4XX64tekfGyNf4uWoCoIq4wxfVc`)
		} else {
			res.render('error', {
				error: "adf",
				message: '',
				title: 'error',
				errorMsg: "Enter one of the search queries"
			})
		}

		const data = await jsonRes.json();
		const arr = []
		data.items.forEach(e => {

			let genre = e.volumeInfo.categories ? e.volumeInfo.categories[0] : "book"
			let dataImg = e.volumeInfo.imageLinks ? e.volumeInfo.imageLinks.thumbnail : "https://cdn-icons-png.flaticon.com/512/51/51354.png"
			let author = e.volumeInfo.authors ? e.volumeInfo.authors[0] : "Author not available"
			let description = e.volumeInfo.description ? e.volumeInfo.description : "No description available"
			let price = e.saleInfo.listPrice ? e.saleInfo.listPrice.amount : "Price not available"
			let link = e.saleInfo.buyLink ? e.saleInfo.buyLink : "Not available"
			let pages = e.volumeInfo.pageCount ? e.volumeInfo.pageCount : 1
			if(e.volumeInfo.authors && e.volumeInfo.authors.length > 1) author = `${e.volumeInfo.authors[0]} & ${e.volumeInfo.authors[1]}`
			
			const item = {
			title: e.volumeInfo.title,
			author,
			pages,
			genre,
			dataImg,
			description,
			price,
			link
			}
			arr.push(item)
		})

		const context = {
			books : arr,
			title : "search results"
		}

		res.render('books/resultsIndex', context)
	} catch (err) {
		console.log(err);
        res.render('error', {
			error: '',
			message: '',
			title: 'error',
			errorMsg: "not working"
		});
	}
}

async function resultsShow(req, res){
	try {
		const context = {
			book: req.body,
			title: req.body.title
		}
		res.render('books/results', context)
	} catch (err) {
		console.log(err);
        res.render('error', {
			error: '',
			message: '',
			title: 'error',
			errorMsg: "not working"
		});
	}
}




async function showSearch(req, res){
	try {
		let jsonRes;
		const title = req.body.title;
		const author = req.body.author;
		if(title && author){
			jsonRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}+inauthor:${author}&api=AIzaSyA712kv4XX64tekfGyNf4uWoCoIq4wxfVc`)
		} else if (title){
			jsonRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}&api=AIzaSyA712kv4XX64tekfGyNf4uWoCoIq4wxfVc`)
		} else if (author){
			jsonRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}&api=AIzaSyA712kv4XX64tekfGyNf4uWoCoIq4wxfVc`)
		} else {
			res.render('error', {
				error: "adf",
				message: '',
				title: 'error',
				errorMsg: "Enter one of the search queries"
			})
		}

		const data = await jsonRes.json();
		const context = {
			data: data.items[0],
			title: data.items[0].volumeInfo.title,
			author: data.items[0].volumeInfo.authors[0],
			dataImg: data.items[0].volumeInfo.imageLinks.thumbnail,
			pages: data.items[0].volumeInfo.pageCount,
			genre: data.items[0].volumeInfo.categories[0]
		}
		// console.log(data.items[0], data.items[0].pageCount)
		res.render('books/results', context)
	} catch (err) {
		console.log(err);
        res.render('error', {
			error: '',
			message: '',
			title: 'error',
			errorMsg: "not working"
		});
	}
}

async function show(req, res){
	try {
		const oneBook = await Book.findById(req.params.id)
		const context = {
			book: oneBook,
			title: oneBook.title
		}
		res.render('books/show', context)
	} catch (err) {
		console.log(err);
        res.render('error', {
			title: 'error',
			errorMsg: err.message
		});
	}
}


function newBook(req, res){
    res.render('books/new', {
		errorMsg: '',
		title: 'New Book'
	})
}

async function edit(req, res){
	try {
		const currentBook = await Book.findById(req.params.id)
		res.render('books/edit', {
			book: currentBook,
			title: `Edit ${currentBook.title}`,
			errorMsg: ''
		})
	} catch (err) {
		console.log(err);
        res.render('error', {
			message: 'You made an error',
			error: 'ERROR',
			title: 'error',
			errorMsg: err.message
		});
	}
}

async function updateBook(req, res){
	const book = await Book.findById(req.params.id);
    try {
        const bookId = req.params.id
        const bookBody = req.body

        await Book.findByIdAndUpdate(bookId, bookBody, {runValidators: true})
        /// Takes id to find it, req.body is what it is updating
        res.redirect(`/books/${bookId}`)
    } catch(err){
        console.log(err)
        res.render('books/edit', {
			book,
			message: 'You made an error',
			error: 'ERROR',
			title: 'error',
			errorMsg: err.message
		})
    }
}


async function create(req,res){
	try {
		await Book.create(req.body)
		res.redirect('/books')
	} catch(err){
		console.log(err.errors)
		res.render('books/new', {
			title: 'error',
			errorMsg: err
		})
	}
}

async function deleteBook(req, res){
    try {
        await Book.findByIdAndDelete(req.params.id)
        res.redirect('/books')
    } catch(err){
        console.log(err)
        res.render('error', {
			title: 'error',
			errorMsg: err.message
		})
    }
}


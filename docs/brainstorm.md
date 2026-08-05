# Library-archive (brainstorm, planning)

## views
1. currently reading: anit-library
    - displays books currently reading
    - metadata diusplayed per book:
      - cover
      - title
      - author
      - genre
      - pages
2. Library
   - sort books by filters:
     - genre
     - alphabetical
     - status (reading, read, tbr, shelved)
3. book view
   - cover
   - author
   - genre
   - pages
   - status (editable)
4. add book
   - single add flow:
     - scan/type isbn -> display preview of selected book (cover,title, author, genre, pages) -> ask user to confirm -> return to add single or bulk view 
   - bulk add flow
     - scan/type isbn -> display preview of book -> ask user to add to bulk list -> triggers scan another (repeat) -> confirm selected books (ends loop) -> return to add single or bulk

## book metadata
### from google books api
- title
- author
- cover image
- genre
- pages
- published date
### from user
- status (shelved, reading, tbr, read)
- date added to shelf

## first protoype
- json, text based
- add view
- library and book view
- reading view

## architecture exploration
- needs to work on my google pixel (primary place for app)
  - web based or android based
- simple way to store data
  - no account for now, use device storage?
- google books api for book lookup
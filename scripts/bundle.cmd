browserify -t coffeeify --extension=".coffee" --insert-global-vars __filename,__dirname,process,Buffer ../src/main.coffee -o ../scripts.js

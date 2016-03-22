# Antelope
Frontend automation tool (useful for Spryker projects)

### Requirements
- `node.js` 5.0.0 or above;
- `npm` 3.6.0 or above;
- the tool *should* be installed as global module: you may need admin privileges.

### Setup
```
$ npm install -g github:spryker/antelope
```

### How to use it
``` shell
# test antelope: 
antelope test
​
# install core deps: 
antelope install
​
# build assets:
antelope build # it will build the whole project, Zed and Yves
antelope build zed # it will build only Zed assets
antelope build yves # it will build only Yves assets, for all the available themes
antelope build yves --theme|-t demoshop # it will build only Yves assets, just for the specified theme
​
# use watchers:
antelope build zed --watch|-w
antelope build yves --theme|-t themename --watch|-w
​
# debug mode:
antelope build yves --debug|-d
​
# production mode:
antelope build yves --production
```

### Documentation
You can read it on [spryker.github.io](http://spryker.github.io).

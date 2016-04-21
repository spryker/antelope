# Changelog

### 2.0.3
- `package.json` allows module's patch version improvements only

### 2.0.2
- zed entry points fix: now build even within custom bundle

### 2.0.1
- npm public registry ready

### 2.0.0
- version test added (check Spryker GUI bundle compatibility - temporary disabled)

### 2.0.0-beta2
- legacy compatibility for v1 projects with `-l|--legacy` flag

### 2.0.0-beta1
- code refactor
- webpack configuration moved ouside the tool
- new provider implementation

### 1.1.4
- npm public registry ready

### 1.1.3
- new provider implementation

### 1.1.2
- virtual machine watching system improved

### 1.1.1
- resolve bundles root path case-sensitive issues

### 1.1.0
- custom `antelope` object property into webpack configuration 
- disable a theme: set `antelope.disabled = true` property into webpack configuration 
- test added to install command 

### 1.0.0
- `optimizer-loader` added for a better assets organization in public folder
- minor bugfixes
- README updated 

### 0.2.0
- cleaned up code
- build timer *(it says how many seconds antelope takes for each build)*
- consistent watch mode *(if you get a compilation error during build, antelope will watch files anyway instead of exiting)*
- improved error tips 
- improved `antelope install` command *(it will install project and core `npm` deps)*

### 0.1.0
This is the first public release od Antelope.

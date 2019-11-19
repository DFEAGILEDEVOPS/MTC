# Useful tools for creating load tests

## XPath debugger
 http://videlibri.sourceforge.net/cgi-bin/xidelcgi

## Code Snippets

### XPath for pupil checkboxes
```xpath
//*[1]/input[1 and @type='checkbox']/@value
```

### XPath for _csrf
```xpath
//*/input[@name='_csrf']/@value
```

### concatenate the string 'teachers' with the value of the `__threadNum` variable
```java
${__V(teacher${__threadNum})}
```


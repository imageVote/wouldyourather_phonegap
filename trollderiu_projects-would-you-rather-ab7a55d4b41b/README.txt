
needs install header apache module for some .htaccess
"a2enmod headers"

//

"a2enmod rewrite"
in apache2.conf:

#AllowOverride None
AllowOverride All

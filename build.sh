
rm -R www

rm -R would-you-rather
git clone --depth 1 https://trollderiu@bitbucket.org/trollderiu_projects/would-you-rather.git
rm -Rf would-you-rather/.git
mv would-you-rather www

rm -R imageVote_public
git clone --depth 1 https://trollderiu@bitbucket.org/trollderiu_projects/imageVote_public.git
rm -Rf imageVote_public/.git
mv imageVote_public www/~commons

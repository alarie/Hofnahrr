# no db used, but capistrano needs that, so it's in here
server "alarie.de", :app, :web, :db, :primary => true
set :user, "hofnahrr"
set :deploy_to, "/var/www/hofnahrr"

set :use_sudo, false

set(:settings_file) { "#{deploy_to}/current/hofnahrr/public/js/settings.js" }
set(:base_url) { "http://alarie.de:2304/" }

# no db used, but capistrano needs that, so it's in here
server "alarie.de", :app, :web, :db, :primary => true
set :user, "alarie"
set :deploy_to, "/var/www/hofnahrr"


set(:settings_file) { "#{deploy_to}/current/public/js/settings.js" }
set(:base_url) { "http://alarie.de:2403/" }

set :use_sudo, true
set :node_binary, "/usr/bin/node"

set :node_env, "production"
set :node_user, "alarie"

set :upstart_job_name, "hofnahrr"

set :app_command, "startup.js"
set :app_environment, "PORT=2403"

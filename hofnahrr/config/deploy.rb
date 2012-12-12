require 'capistrano/ext/multistage'

default_run_options[:pty] = true

set :application, "Hofnahrr"
# use git with the specified repository
set :scm, "git"
set :repository,  "https://github.com/alarie/Hofnahrr.git"
set :branch, "master"

# ssh stuff
# forward ssh login so rsa is used
set :ssh_options, { :forward_agent => true }

set :deploy_via, :remote_cache

# capistrano-ext options
set :stages, ["dev", "production"]
set :default_stage, "dev"


# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"
#
namespace :deploy do
    task :restart, :roles => :web do
        settings = capture("cat #{settings_file}")

        settings.gsub!(/BASE_URL\s*:\s*'([^']+)'/m, "BASE_URL : '#{base_url}'")

        put(settings, settings_file)
    end

end


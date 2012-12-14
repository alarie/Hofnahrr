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

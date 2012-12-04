var that = this;
if (!this.verified && !(me && (me.isAdmin || me.id === this.creator))) {
    // @Simon, right now (0.6.x) you can called "cancel()" to skip the object. 
    // As a heads-up, that behavior is going to change in 0.7: the "cancel()" 
    // function will throw an error (more consistently with POST, PUT, DELETE, etc.), 
    // and you'll have another "On Query" event at your disposal to modify the 
    // query before it actually goes to the database.
    cancel();
}
else {
    if (this.pictures) {
        this.pictures.forEach(function (pic, i) {
            if (!pic.id) {
                var name = pic.name;
                if (!name) {
                    name = /[^\/]+$/.exec(pic.url)[0];
                    that.pictures[i].name = name;
                }
                that.pictures[i].id = name;
            }
        });
        this.icon = this.pictures[0];
    }
}
var that = this;
if (!this.verified && !(me && (me.isAdmin || me.id === this.creator))) {
    console.log("hiding:", this.name);
    console.log(this);
    hide('name');
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
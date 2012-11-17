if (this.pictures) {
    this.pictures.forEach(function (pic) {
        if (!pic.id) {
            pic.id = pic.name;
        }
    });
}
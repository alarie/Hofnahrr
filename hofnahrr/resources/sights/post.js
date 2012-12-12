if (!me) {
    cancel("You are not authorized to do that", 401);
}
else {    
    if (typeof this.unknown === 'undefined') {
        this.unknown = false;
    }
    this.speakingId = this.name.toLowerCase().replace(/[\s!\?\$\.:]/g, '-');
    this.creator = me.id;
}
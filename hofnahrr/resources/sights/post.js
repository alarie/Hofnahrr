if (this.unknown  || me) {
    if (typeof this.unknown === 'undefined') {
        this.unknown = false;
    }
    this.speakingId = this.name.toLowerCase().replace(/[\s!\?\$\.:]/g, '-');
    this.creator = me.id;
}
else {    
    cancel("You are not authorized to do that", 401);
}
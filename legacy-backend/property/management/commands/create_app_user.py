from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Creates a new application user with a specified role (owner or manager)."

    def add_arguments(self, parser):
        parser.add_argument("--username", type=str, required=True, help="Username for the new user")
        parser.add_argument("--email", type=str, required=False, default="", help="Email address (optional)")
        parser.add_argument("--password", type=str, required=True, help="User password")
        parser.add_argument(
            "--role",
            type=str,
            choices=["owner", "manager"],
            default="manager",
            help="Role to assign (owner or manager). Defaults to manager.",
        )

    def handle(self, *args, **options):
        username = options["username"]
        email = options["email"]
        password = options["password"]
        role = options["role"].lower()

        if User.objects.filter(username=username).exists():
            raise CommandError(f'User with username "{username}" already exists.')

        # Only check duplicate email if an email was actually provided
        if email and User.objects.filter(email=email).exists():
            raise CommandError(f'User with email "{email}" already exists.')

        # Create user instance
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        # Set role if your Custom User Model has a 'role' field
        if hasattr(user, "role"):
            user.role = role
            user.save()

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created user "{username}" with role "{role}".')
        )